# 首页第一轮调整与验收

核对日期：2026 年 10 月 15 日。基线为已合并 PR #11 的 `15ed21a`。

## 修改范围

1. 中文首页的标题、搜索描述、Open Graph、Twitter 分享文案、首屏按钮和收尾文案改为中文；中文页脚同步翻译原有英文句子。
2. 中英文首页使用本站已有的真实浏览器截图。首屏展示简单 PSD 保存重开后的画布与两个像素图层；入门区分别展示打开图片、图层编辑和 PNG 导出步骤。保留原创练习 PNG 的直接下载及教程锚点。
3. 首页版本区区分官方最新桌面发布、下载指南已核对文件、本站托管 Web 构建以及历史桌面 CLI 测试。
4. 中英文首页各从 16 个二级标题收拢为 7 个：实测入门、下载与版本、功能对比、来源与帮助、Craft 工具、FAQ、开始编辑。移除重复下载／教程／对比资源卡，相关内页和 Craft 链接继续保留。
5. 原生菜单、语言切换、编辑器引擎和路由保持现有实现。没有引入轮播、系统推荐交互、登录流程、新模板或新的统计脚本。

## 版本依据与实测范围

- [官方最新发布](https://github.com/storytold/photocraft/releases/tag/v0.9.0)：GitHub Releases API 在 2026 年 10 月 15 日返回 v0.9.0，发布时间为 `2026-10-14T16:36:26Z`。
- 下载指南现有文件为 [v0.8.2](https://github.com/storytold/photocraft/releases/tag/v0.8.2)，原核对日期为 2026 年 10 月 14 日。本轮不替换安装文件，也不声称已经运行 v0.9.0。
- 首页展示的基础 PNG 编辑、简单双图层 PSD 保存／重开截图来自 2026 年 10 月 10 日记录。
- 历史 Windows x64 CLI 样例使用 v0.7.0，保留原范围；不改写为新版桌面 GUI、Mac 或 Linux 安装实测。
- 固定 PhotoCraft Web 引擎为 `72921900975c7e6f`；PhotoCraft、CADCraft WASM 的 SHA256 均与原清单一致。

## 本地验收

在仓库目录用 PowerShell 执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
$env:CHECK_BASE_URL='http://127.0.0.1:4204'
npm.cmd run check
npm.cmd run audit:upload
npm.cmd run deploy:dry-run
git diff --check
```

开发服务器端口为 4204，生产构建预览端口为 5204。生产预览可用 `node scripts/server.mjs --production --port 5204` 启动；本地服务器始终发送禁止搜索收录的响应头。

结果：

- 生产构建和生产检查通过：60 页、165 文件。
- 开发路由检查通过：60 条路由、87 项资源、2,952 处站内链接。
- 生产 HTML 的 544 处页内锚点全部存在；sitemap 仍为 46 个唯一内容地址。
- 中文首页标题、搜索描述、社交分享文案、canonical、index/follow 与 en/zh/x-default 语言标签通过检查。
- 浏览器检查中英文首页各四种实际 CSS 屏宽：1440、767、390、320；首屏截图正常加载，页面无横向溢出。
- 实际点击手机菜单进入 WordCraft，再返回首页；首页下载按钮进入正确下载页；练习 PNG 成功下载；入门卡进入 `/zh/tutorial#open`。
- 英文首页语言菜单切换到中文首页，页面标题同步更新；FAQ 正常展开，浏览器错误日志为空。
- 上传文件扫描未发现凭据；Worker dry-run 通过。dry-run 不是生产部署。

浏览器截图、屏宽记录和静态检查 JSON 放在忽略目录 `evidence/homepage-first-round/`，不上传测试产物或本地工具。GitHub 推送、PR 检查、合并和正式上线须分别核验；本轮交付到 GitHub PR，不执行合并或生产部署。
