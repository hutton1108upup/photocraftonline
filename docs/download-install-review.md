# 下载与安装迭代本地审查

日期：2026-10-10。范围为下载需求方案的第 1、2 项；从 `origin/main` 的 `ae3b4b8` 开始，保留已合并的 P0–P1 页面改进。

## 本次完成

1. 中英文下载页首屏突出免费、上游来源和独立站关系，保留在线编辑入口，增加 Windows、Mac、Linux、portable、最新发布的页内导航。
2. Windows 提供 x64、ARM64、x86 的 MSI 与 portable ZIP 直接链接，解释架构判断、安装向导、完整解压和 `photocraft.exe` 启动步骤。
3. Mac 保留 Universal DMG、Intel/Apple Silicon 说明和 `#mac` 旧锚点，补充复制到 Applications、启动和成功检查。
4. Linux 提供 x86_64、aarch64 选择，覆盖 AppImage、DEB、RPM、Flatpak 下载与安装命令，按发行版说明格式选择。
5. 系统识别仅作推荐，Android、iPhone、iPad 不被推荐为桌面 Linux/Mac；无法识别时保留全部系统入口。未自动猜测处理器架构。
6. 没有 JavaScript 时，所有架构下载链接仍可使用；安装详情使用原生 details。语言菜单重新读取当前 URL，修复页内跳转后切换语言丢失锚点的问题。
7. 将开发者 Web 构建说明折叠在末尾；移除下载页未使用的编辑器大图预加载。

## 已完成的自查

- `npm.cmd run build:production`：生成 26 个页面及本地 WebAssembly 编辑器。
- `npm.cmd run check:production`：26 页、83 个文件通过域名、标题、canonical、索引、内部文件和资源检查。
- `npm.cmd run check`，`CHECK_BASE_URL=http://127.0.0.1:5181`：26 路由、43 个资源、482 个内部链接通过，原编辑器资源哈希保持一致。
- 浏览器检查共 16 个场景：中英文 × Windows、Mac、Linux、Android、iPhone、iPad、未知系统，以及中英文禁用 JavaScript。
- 检查各架构选择、所有 Linux 格式展开、页内链接目标、手机菜单与 Escape、语言切换保留锚点、375/390px 页面无横向溢出；未观察到浏览器控制台或脚本错误。
- 两种语言各 15 个安装包链接与 GitHub `v0.6.0` 发布 API 文件清单逐项一致。
- `node --check src/scripts/site.js`、`git diff --check`、上传白名单与凭据扫描通过。
- `npm.cmd ci` 安装固定依赖，未修改 lockfile，报告 0 个漏洞；`npm.cmd run deploy:dry-run` 打包检查通过，仅模拟打包，未发布。

浏览器证据保留在本机 `evidence/download-browser-review.json` 和 `evidence/download-*.png`；临时检查脚本在 `.local/review-download.py`。这些本地目录不上传。

## 审查预览

- 英文：<http://localhost:4181/download>
- 中文：<http://localhost:4181/zh/download>

预览关闭后，在本项目 PowerShell 按顺序执行：

```powershell
Set-Location -LiteralPath 'C:\Users\胡天天\.codex\worktrees\2831\photocraft'
npm.cmd run build:production
npm.cmd run check:production
node scripts/server.mjs --production --port 4181
```

成功提示依次为 `Built 26 production pages`、`PASS production`、`PhotoCraft local preview: http://localhost:4181 (26 pages)`。任一步失败就停在该步；端口已占用时先核对所属服务，勿停止未知进程。预览期间保留终端，结束后按 `Ctrl+C`。

## 事实与边界

- 安装包链接固定为核验时的 `v0.6.0`，明确提供上游 `/releases/latest` 与全部发布记录。没有增加自动版本同步或独立系统专页。
- 安装操作说明参考上游发布文档和常规包管理器流程；没有在用户电脑安装桌面程序，也没有在 Windows/Mac/Linux 实机上验证安装成功。页面不会把步骤写成已完成实机测试。
- 本记录只证明本地源码与检查结果；GitHub 推送、合并和部署状态以实际交付结果为准。
- 上游来源：[发布文件](https://github.com/storytold/photocraft/releases/tag/v0.6.0)、[下载说明](https://github.com/storytold/photocraft#downloads)、[版本对应的打包说明](https://github.com/storytold/photocraft/blob/v0.6.0/docs/releasing.md)。
