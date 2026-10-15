# 首页第二轮调整与验收

核对日期：2026 年 10 月 15 日。基线为已合并 PR #12 的 `ef32823`，交付分支为 `codex/homepage-second-round`。

## 修改范围

1. 中英文首页、下载总览增加 Windows / Mac / Linux 系统切换。浏览器信息只推荐系统，不能判断处理器架构；手机、iPad 桌面模式、ChromeOS 和未知系统显示明确提示，仍可手动选择目标电脑。
2. 首页展示常用 Windows x64 MSI、Mac Universal DMG、Linux x86_64 AppImage；其他架构、免安装方式和格式折叠展示，并链接到原有安装指南。下载总览保留 Windows 指南、Linux 架构选择和安装命令。
3. 首页和 Photoshop 对比页补充“适合先尝试”和“迁移前先验证工作流”两组结论，分别连接入门教程和迁移检查清单。
4. 中英文共享导航把功能介绍、下载与安装、入门教程、Photoshop 对比设为直接链接；更多 Craft 工具继续保留分组。手机导航同步，支持当前页面标记与原有键盘操作。源码、版本、安全与帮助仍可从首页和页脚到达。

## 交互与版本边界

- 只有 JavaScript 正常运行后才隐藏未选中的系统面板。禁用 JavaScript 时，三个系统的内容和下载入口全部保留。
- 系统切换支持左右方向键、Home、End、焦点和 ARIA 状态；下载总览的 `#windows`、`#macos`、`#mac`、`#linux` 深链接会展开对应内容。
- 用户手动切换不会自动下载、跳转、记录设备信息或写入本地存储；重新加载时重新按浏览器与地址锚点选择。
- 下载地址继续固定为已核对的 [PhotoCraft v0.8.2](https://github.com/storytold/photocraft/releases/tag/v0.8.2)。本轮通过官方 GitHub Releases API 再次确认首页三个文件地址存在，没有下载或运行安装包。
- 第一轮的官方最新发布、下载指南快照、本站 Web 构建、历史 CLI 测试范围说明保留；没有把历史验证改写为新版桌面安装验证。
- 首页仍为 7 个二级内容标题；不新增页面、依赖、统计脚本或弹窗。PhotoCraft、CADCraft 引擎不变。

## 本地检查

在仓库根目录的 PowerShell 中执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
$env:CHECK_BASE_URL='http://127.0.0.1:4205'
npm.cmd run check
npm.cmd run audit:upload
npm.cmd run deploy:dry-run
git diff --check
```

路由检查需先运行 `node scripts/server.mjs --port 4205`。生产预览使用 `node scripts/server.mjs --production --port 5205`，可查看 `http://localhost:5205/zh#desktop-downloads`。本地服务器发送禁止搜索收录的响应头。

结果：

- 生产构建与检查通过：60 页、165 个输出文件；路由检查通过 60 条路由、87 项资源和 2,544 处站内链接。
- 生产 HTML 检查通过：444 处内部锚点均存在，没有重复 ID；sitemap 为 46 个唯一内容地址。PhotoCraft、CADCraft WASM 的 SHA256 与固定清单一致。
- 系统矩阵覆盖 Windows、Mac、Linux、Android、iPhone、iPad 桌面模式、未知系统、ChromeOS、Client Hints，每种检查中英文首页和下载总览共四条路由；初始提示、手动切换与键盘切换均通过。Client Hints 测试夹具修正后单独续跑，其余八种已在前次运行通过。
- 下载总览深链接、`#mac` 别名、页内切换、Linux ARM64 及 Windows ARM64 文件选择、下载子页导航标记检查通过。
- 桌面菜单方向键与 Escape、手机导航点击后关闭检查通过；禁用 JavaScript 的四条路由均展示全部三个系统面板。
- 中英文首页分别在 1440、1100、768、390、320 CSS 像素宽度检查，无横向溢出；查看了桌面下载、手机下载和适用人群截图，布局正常。浏览器未捕获页面错误。
- 在实际 Chrome 中点击 Mac、Windows，面板、文件名和官方链接同步更新。
- 上传扫描无凭据发现，Worker dry-run 通过。dry-run 不代表生产部署。

临时测试脚本在忽略目录 `.local/round2-qa.py`，截图与 JSON 在忽略目录 `evidence/homepage-second-round/`。本轮交付到 GitHub PR；主分支合并和生产上线另行核验，不在本轮执行。
