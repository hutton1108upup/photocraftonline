# 首页第三轮调整与验收

核对日期：2026 年 10 月 15 日。基线为已合并 PR #13 的 `d2b2af8`，交付分支为 `codex/homepage-third-round`。

## 按批准顺序完成的修改

1. 中英文首页、下载总览和 Windows 指南的桌面下载统一更新到 v0.9.0；Windows 搜索及分享描述也同步当前下载版本。官网下载资产中的 15 个文件名及 SHA256 与官方 SHA256SUMS.txt 逐项比对。当前 Windows 便携模式与安装向导资料链接改为 v0.9.0；v0.7.0 历史 CLI 测试保留原版本和日期。
2. 下载区移到首屏后；首屏下载按钮定位本页系统选择。下载版本和核对日期直接可见，网页版与历史测试细节放在原生展开项。手机教程保留简短三步和一张练习图，桌面仍显示实测步骤截图。
3. 适用人群结论移到简短对比前，首页展示基础图片编辑、简单 PSD、复杂工作流三项判断；完整表格、来源和详细测试范围由既有对比内页承接。
4. 中英文顶栏入口改为“实测入门 / Tested walkthrough”。顶栏和手机菜单增加直接语言链接，切换到当前页面的另一语言版本，并保留查询参数与锚点。页脚原有语言菜单独立保留。正文锚点统一预留固定顶栏空间。

## 下载版本核验

- 官方最新发布 API 返回 [v0.9.0](https://github.com/storytold/photocraft/releases/tag/v0.9.0)，发布时间为 `2026-10-14T16:36:26Z`。
- 下载了官方 [SHA256SUMS.txt](https://github.com/storytold/photocraft/releases/download/v0.9.0/SHA256SUMS.txt)，其 SHA256 为 `2703d9d6eac10659bc3538918296f5a5e67fc3a6a72e78205651640b7ca0f20c`，与 GitHub Release 资产元数据一致。
- 页面使用的 Windows 六种 MSI/ZIP、Mac Universal DMG、Linux 两种架构的四类文件，共 15 项，文件名存在且 Release API 的资产 SHA256 与校验清单一致；完整记录见同目录 `photocraft-v0.9.0-download-verification.json`。
- 这是发布文件元数据与官方校验清单的交叉核验；未下载全部安装包，也未执行 v0.9.0 安装或 GUI 验收。网页文案保留这一边界。
- 本站 Web 引擎不随桌面版升级。旧 CLI、PNG 和简单 PSD 实测的日期与范围保持原记录。

## 本地检查

仓库根目录 PowerShell：

```powershell
npm.cmd run build:production
npm.cmd run check:production
$env:CHECK_BASE_URL='http://127.0.0.1:4206'
npm.cmd run check
npm.cmd run deploy:dry-run
npm.cmd run audit:upload
git diff --check
```

开发服务器：`node scripts/server.mjs --port 4206`；生产预览：`node scripts/server.mjs --production --port 5206`。检查结果：

- 60 页生产构建和生产检查通过；开发检查通过 60 条路由、87 项资源、2,598 处站内链接。
- 生产 HTML 检查通过：446 处内部锚点均存在，无重复 ID、未替换语言变量或无效语言目标。58 个共享页头的语言链接均对应已存在的页面。
- sitemap 保持 46 个唯一内容地址，首页仍为 7 个二级内容标题，固定 PhotoCraft/CADCraft WASM 哈希一致。
- 中英文各测试 1440、1100、1099、768、390、320 CSS 像素宽度；无横向溢出，1100px 桌面导航与两侧内容无重叠。
- 390 × 844 中文预览中，下载区约在顶部 826px，系统选择约在 998px；英文系统选择约在 1230px。两种语言的系统选择都在第二屏范围内。中文手机教程约高 1,238px，且仅显示一张练习图。
- Windows、Mac、Linux、Android、iPad 桌面模式和未知系统分别覆盖中英文首页/下载页；提示及手动切换正常。键盘切换、版本展开项、Linux ARM64 和 Windows x64/ARM64/x86 选择通过。
- 首页下载按钮、适用人群到迁移清单、原有系统深链接和固定顶栏下的锚点定位通过。
- 桌面语言切换覆盖下载、Windows、EffectCraft 桌面教程、WordCraft、GridCraft，两种方向均保留当前路径、查询参数和锚点。手机菜单语言切换、导航收起、页脚语言菜单及 Escape 操作通过。
- 无 JavaScript 的中英文首页和下载总览仍保留三种系统入口，桌面语言链接可用。
- 浏览器未捕获页面错误；下载区和适用人群截图已人工检查。上传扫描无发现，Worker dry-run 通过。

截图和临时测试脚本保存在忽略目录 `evidence/homepage-third-round/`、`.local/round3-qa.py`。本轮只交付 GitHub PR，不合并 main 或部署生产，不新增统计脚本、图片格式转换、页面或依赖。
