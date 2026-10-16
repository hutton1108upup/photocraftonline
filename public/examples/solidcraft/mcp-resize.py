"""Verify the SolidCraft mounting-plate example using MCP, without an AI account.

Python 3.9+, standard library only. Input: the 60 mm design linked in the guide.
Writes new files inside --out; refuses to overwrite existing output files.
"""

import argparse
import json
import math
from pathlib import Path
import queue
import subprocess
import threading


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cli", required=True, type=Path)
    parser.add_argument("--design", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    cli = args.cli.resolve(strict=True)
    design = args.design.resolve(strict=True)
    output = args.out.resolve()
    output.mkdir(parents=True, exist_ok=True)
    names = ["plate-80.solidcraft", "plate-80.step", "plate-80.png", "check.json", "mcp-stderr.log"]
    for name in names:
        if (output / name).exists():
            raise FileExistsError("Choose a new output folder; refusing to overwrite " + name)

    messages = queue.Queue()
    with (output / "mcp-stderr.log").open("w", encoding="utf-8") as errors:
        process = subprocess.Popen(
            [str(cli), "mcp", "--allow-path", str(design.parent), "--allow-path", str(output)],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=errors,
            text=True, encoding="utf-8",
        )

        def read_messages():
            for line in process.stdout:
                messages.put(line)
            messages.put(None)

        threading.Thread(target=read_messages, daemon=True).start()
        sequence = 0

        def request(method, params):
            nonlocal sequence
            sequence += 1
            process.stdin.write(json.dumps({"jsonrpc": "2.0", "id": sequence, "method": method, "params": params}) + "\n")
            process.stdin.flush()
            while True:
                try:
                    line = messages.get(timeout=45)
                except queue.Empty:
                    raise TimeoutError("MCP timed out; inspect mcp-stderr.log")
                if line is None:
                    raise RuntimeError("MCP exited; inspect mcp-stderr.log")
                message = json.loads(line)
                if message.get("id") == sequence:
                    break
            if "error" in message:
                raise RuntimeError(message["error"])
            result = message["result"]
            if result.get("isError"):
                raise RuntimeError(result)
            return result

        def tool(name, arguments=None):
            result = request("tools/call", {"name": name, "arguments": arguments or {}})
            for block in result.get("content", []):
                if block["type"] == "text":
                    try:
                        return json.loads(block["text"])
                    except json.JSONDecodeError:
                        return block["text"]
            return None

        def check_measurement(measured, width):
            assert measured["body_count"] == 1, "Expected one body"
            body = measured["bodies"][0]
            dimensions = [b - a for a, b in zip(body["bbox"]["min"], body["bbox"]["max"])]
            assert all(abs(a - b) < 0.001 for a, b in zip(dimensions, [width, 30, 4])), dimensions
            expected = (width * 30 - 2 * math.pi * 3 ** 2) * 4
            assert abs(body["volume_mm3"] - expected) / expected < 0.00001, "Unexpected volume"
            return {"body_count": 1, "dimensions_mm": dimensions, "volume_mm3": body["volume_mm3"], "analytic_volume_mm3": expected}

        try:
            request("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "mounting-plate-check", "version": "1.0"}})
            process.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}\n')
            process.stdin.flush()
            tool("open", {"path": str(design)})
            before = check_measurement(tool("measure"), 60)
            tool("set_parameter", {"name": "width", "value": "80 mm"})
            inspected = tool("inspect_design", {"sketches": True})
            assert not any(feature.get("error") for feature in inspected["timeline"]), "Timeline error"
            profile = next(sketch for sketch in inspected["sketches"] if sketch["name"] == "PlateProfile")
            assert profile["dof"] == 0, "Sketch is not fully constrained"
            circles = [curve for curve in profile["curves"] if curve["type"] == "circle"]
            centers = sorted(curve["center_at"] for curve in circles)
            assert centers == [[10.0, 15.0], [70.0, 15.0]], centers
            assert all(abs(curve["radius"] - 3) < 0.0001 for curve in circles), "Unexpected hole diameter"
            after = check_measurement(tool("measure"), 80)
            tool("screenshot", {"path": str(output / "plate-80.png"), "source": "model", "view": "iso"})
            tool("save", {"path": str(output / "plate-80.solidcraft")})
            tool("export", {"path": str(output / "plate-80.step")})
            tool("open", {"path": str(output / "plate-80.solidcraft")})
            reopened = check_measurement(tool("measure"), 80)
            tool("open", {"path": str(output / "plate-80.step")})
            reimported = check_measurement(tool("measure"), 80)
            report = {"status": "PASS", "before": before, "after": after, "hole_centers_mm": centers, "sketch_dof": 0, "reopened": reopened, "step_reimport": reimported}
            (output / "check.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
            for name in names[:4]:
                assert (output / name).stat().st_size > 0, "Missing output " + name
            print("PASS: 80 x 30 x 4 mm, two diameter-6 mm holes, native reopen and STEP reimport.")
        finally:
            process.terminate()
            process.wait(timeout=10)


if __name__ == "__main__":
    main()
