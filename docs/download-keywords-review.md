# 下载关键词内页改进验收

核对日期：2026-10-23。范围：本地修改与自查，未提交、推送或部署。

## 已完成

1. PhotoCraft `/download` 和 `/download/windows` 中英文下载快照更新至 v0.10.0。下载页首屏加入 Windows x64、Mac Universal、Linux x86_64 直接入口及文件类型说明，保留其他架构指南。
2. 新增中英文 `/artcraft-download`，区分 ArtCraft AI、单款 Craft 应用和 Launcher。已接入路由、语言切换、面包屑、索引白名单及生产 sitemap。
3. WordCraft 下载与安装区更新至 v0.8.0，并前置下载表。旧 v0.6.1 功能参考明确保留版本，不作为新版本全面验证。添加可下载的 CLI 小样与测试边界。
4. 应用目录补充 Seven Apps, One Craft 搜索意图，注明当前官方目录为 13 款，不编造短语历史来源。
5. GitHub 页前置 Storytold 项目、Releases、Issues 和下载去向；产品页和教程补充下载内链。

## 来源核验

- https://getartcraft.com/download
- https://getartcraft.com/apps
- https://getartcraft.com/apps/photocraft
- https://getartcraft.com/apps/wordcraft
- https://github.com/storytold/photocraft/releases/tag/v0.10.0
- https://github.com/storytold/wordcraft/releases/tag/v0.8.0

新增版本的下载链接均匹配 GitHub release assets。API 提供的资产摘要与对应 SHA256SUMS.txt 一致。WordCraft Windows x64 portable ZIP 实际下载后另行验证 SHA256，通过后运行其中 CLI；没有运行安装器。

## WordCraft 样例结果

样例位于 `public/samples/wordcraft/`，由本站创建，不包含用户文档。

使用 v0.8.0 Windows x64 CLI 将英文 Markdown 转成 DOCX；用 `run --file` 打开，通过 `caret.docEnd` 和 `text.insert` 加入 `Verified saved copy.`，保存新 DOCX；`text` 重新读取后确认新增内容存在。`convert` 导出 PDF 成功；`render` 生成 DOCX 预览，人工查看标题、列表、表格和新增文字可见。

保留原稿、保存后 DOCX、PDF 和 PNG。没有验证桌面 GUI、中文排版、Microsoft Word 往返，也没有逐项认证 PDF 版式。原始 CLI 参数与输出记录在 `.local/wordcraft-sample-result.json`。

## 检查结果

- `npm.cmd run build:production`：76 页构建成功。
- `npm.cmd run check:production`：76 页、236 文件，域名、索引、站内资源及编辑器检查通过。
- `CHECK_BASE_URL=http://127.0.0.1:18763 npm.cmd run check`：76 路由、140 本地资源、3880 内链通过（PowerShell 使用 `$env:CHECK_BASE_URL` 设置环境变量）。
- Chromium：390 与 1440 像素宽度，6 类页面 × 2 语言 × 2 宽度，共 24 组。无整页横向溢出、无失效页内锚点、无 JavaScript 异常。Windows/Mac/Linux 切换通过；新页语言切换目标存在。
- 新增下载页手机截图已查看，正文与页脚布局正常。
- `git diff --check`：通过。

本地预览使用 `http://127.0.0.1:18763`。未修改登录、支付或编辑器引擎；未进行远程写入。
