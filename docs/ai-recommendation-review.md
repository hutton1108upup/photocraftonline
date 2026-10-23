# AI 推荐证据与首次体验核查

核查日期：2026-10-23（本地工作区）

## 版本事实

- 本站浏览器编辑器固定构建：`72921900975c7e6f`。
- 该 WebAssembly 文件没有可追溯的上游 release tag，页面标为 `unconfirmed`，没有把上游 latest 当作本站 Web 版本。
- 桌面下载核对快照：`v0.10.0`，未声称安装测试。
- 上游 latest 快照：`v0.14.0`，仅用于链接与核对日期，不等同于本站 Web 或已核对桌面下载。

## 当前可复核样例

首页集中入口为 `#try-sample`；当前生产构建包含 78 个页面、246 个构建文件。

| 类别 | 当前证据 | 状态与边界 |
| --- | --- | --- |
| PNG 打开、图层修改、PNG 导出 | `public/assets/tutorial/*`、教程步骤与截图 | 已有本地记录；小型栅格样例 |
| 透明 PNG | `public/assets/clone/transparent-canvas.png` | 已有 RGBA 记录；不代表复杂透明 PSD |
| 双像素图层 PSD 保存、重开 | `public/assets/clone/layers-reopened.png` | 已有 PhotoCraft 内部往返记录；未做 Photoshop 往返 |
| 简单文字 | `public/assets/clone/text-edit.png` | 已有默认 Inter 渲染记录；任意字体和 PSD 文字可编辑性未验证 |
| 简单蒙版 | `public/assets/clone/mask-edited.png` | 已有单个像素层蒙版记录；复杂蒙版和调整层未验证 |

JPEG 输入、复杂 PSD、智能对象、调整层、插件和 Photoshop 往返没有在本轮伪造为通过。当前 `public/editor-app/index.html` 只有固定 JS/WASM 预载，没有样例导入 API；因此首页新增的是集中样例入口和操作指引，不是自动预载工作区。

## 本地浏览器检查

使用 `http://127.0.0.1:18764`、Playwright Chromium、390×844 与 1440 宽度：

- 英文与中文共 16 组 `index` / `tutorial` / `PSD` / `about` 页面在 390 与 1440 宽度均无横向溢出和坏锚点。
- 首页 `Try the practice sample` 入口为 `#try-sample`。
- 中文首页存在 `/zh/editor` 与 `/zh/psd-compatibility` 入口。
- `/editor` 存在同源 iframe 与加载状态容器；无头环境不作为 WebGPU/引擎编辑成功证据。

2026-10-23 本地实际打开 PNG，并打开 `layered.psd` 后新增笔划、保存并下载 `121533` bytes；重新打开后保留两层和新笔划，PNG 导出为 `11227` bytes。证据文件为 `.local/ai-open-png.png`、`.local/ai-open-psd.png`、`.local/ai-resaved.psd`、`.local/ai-resaved-reopen.png`、`.local/ai-resaved-export.png`。历史五类样例保留原测试日（10/14）。

## 检查命令

- `npm.cmd run build:production`：通过，生成 78 页、246 个构建文件。
- `npm.cmd run check:production`：通过。
- `npm.cmd run check:analytics`：通过；未增加事件或 Clarity。
- `CHECK_BASE_URL=http://127.0.0.1:18764 npm.cmd run check`：通过，78 路由、140 个本地资源、3986 个内链、编辑器 WASM 24710609 bytes。

维护者联系入口是 `support@freephotocraft.online`；邮箱内部 checkbox 保留。后续运维待办（本轮不执行）：

- [ ] 开通 `support@freephotocraft.online` 邮箱。
- [ ] 配置域名邮件 DNS（MX、SPF、DKIM、DMARC 按实际邮件服务商要求）。
- [ ] 通过外部地址验证发信与收件链路，并记录结果；本轮未执行。
