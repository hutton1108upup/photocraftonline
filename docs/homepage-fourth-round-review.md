# 首页第四轮：截图与关键点击统计验收

核对日期：2026 年 10 月 15 日。基线为已合并 PR #14 的 `7c6063f`，交付分支为 `codex/homepage-images-and-events`。本轮只提交 GitHub PR，未合并 main、未部署生产。

## 已完成的修改

1. 中英文首页及入门教程的 11 张真实截图，新增 480、960、1440 三档无损 WebP，共 33 个文件；使用带源文件哈希的文件名和响应式 picture/srcset。逐张比对转换后的像素；1440 档与原始 PNG 像素一致，缩小档与对应缩小图像素一致。原始 PNG 未修改、仍作为回退和大图来源。11 张全尺寸 WebP 合计 709,544 字节，原 PNG 合计 1,375,651 字节，减少约 48%。这不是整页流量或加载速度的提升百分比。
2. 首屏和教程截图提供“查看大图”，支持适应屏幕、原始尺寸、10%–300% 缩放、原图新标签打开及 Esc/关闭按钮。手机可滚动查看原始尺寸的截图；键盘 Tab 留在弹层，关闭后回到原链接。禁用 JavaScript 时，原链接仍能打开 PNG。
3. 首页三步教程补充截图外的操作重点；手机继续隐藏重复缩略图，保留文字“大图”入口和练习图。首页 preload 与响应式图片候选一致，打开弹层前不重复请求该图的 PNG；教程移除未使用的旧首页图片 preload。
4. 在正式域名的 46 个内容地址启用已确认的 GA4 数据流，并接入七类关键点击；页面浏览单独记录。中英文安全与隐私说明同步实际行为，无新增弹窗、Clarity 或会话回放。

## 统计目标与口径

已由用户确认复用：Google 账号 `duckweed1014@gmail.com`，GA4 账号 `397274745`、媒体资源 `558362043`、数据流 `16101089692`，衡量 ID `G-4M2NQH5S01`，对应 `https://freephotocraft.online`。本轮没有改动 Google 后台设置。

| 事件 | 触发条件 | 固定参数 |
| --- | --- | --- |
| `editor_open` | 点击本站 PhotoCraft 编辑器入口 | 入口位置 |
| `download_section_click` | 点击首页定位下载区 | 入口位置 |
| `desktop_download_click` | 点击匹配官方 PhotoCraft 发布包的文件链接 | 入口位置、系统、架构、格式、版本 |
| `tutorial_click` | 点击本站 PhotoCraft 入门教程或其步骤 | 入口位置、教程步骤 |
| `platform_select` | 手动点击或用方向键/Home/End 选择下载系统 | 入口位置、系统 |
| `practice_download_click` | 点击指定练习 PNG 的下载链接 | 入口位置 |
| `screenshot_open` | 成功打开本站大图弹层 | 首页/教程、截图编号 |

自定义事件另带界面语言、页面类型及净化后的页面地址；来源仅保留 origin。只允许固定事件名、入口、系统和资源编号，不读取用户文件、文件名或输入值，不传查询参数和锚点。自动推荐系统不算手动选择；定位下载区与真正点击文件分开计数。点击不代表编辑成功、下载完成或安装完成。

仅生产构建、准确 HTTPS 正式 origin 和声明路径匹配时加载 GA4。本地、workers.dev、其他 origin、编辑器和引擎地址均不加载本站标签。重复初始化不重复加标签/页面浏览；Google signals 与广告个性化信号关闭。统计不阻止或延迟原链接跳转。浏览器拦截或离开页面过快仍可能造成漏记。

官方 GA4 数据流保留已有增强型衡量设置，可能另外产生通用 click/file_download 等事件。分析本轮按钮效果时使用上表事件，不与这些通用事件相加；本轮没有创建自定义维度、设为 GA4“关键事件”或改动归因设置。

## 验证结果

在仓库根目录 PowerShell 执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
npm.cmd run check:analytics
$env:CHECK_BASE_URL='http://127.0.0.1:4207'
npm.cmd run check
npm.cmd run deploy:dry-run
npm.cmd run audit:upload
git diff --check
```

开发服务器 `node scripts/server.mjs --port 4207`，生产预览 `node scripts/server.mjs --production --port 5207`。

- 60 页生产构建/检查通过；开发检查通过 60 路由、122 本地资源和 2,598 站内链接。
- 静态回归检查通过：438 处内部锚点、58 个语言链接、46 个唯一 sitemap 地址；PhotoCraft/CADCraft 固定 WASM 哈希未变。
- 中英文首页/教程在 1440、390、320px 共 12 个场景通过大图缩放、原始尺寸滚动、关闭和焦点回归。另测不同图片切换、无 JS 原图链接。人工检查中英文桌面及手机截图。
- 首页回归覆盖中英文各 1440、1100、1099、768、390、320px；导航、语言切换、下载区及适用人群入口通过；Windows、Mac、Linux、Android、iPad 和未知系统推荐/手动选择通过；无 JS 的四条首页/下载路由仍可用。
- Node VM 检查生产白名单、9 类关闭情形、参数过滤、官方文件识别和初始化去重，通过并加入 GitHub CI。脚本已纳入上传审查白名单。
- Playwright 在完全离线的正式域名夹具中执行中英文按钮链路：每种语言 1 次页面浏览、1 次下载区定位、2 次手动系统选择、1 次文件点击、1 次编辑器入口、1 次教程入口和 1 次大图打开，计数正确。Google 标签被本地空脚本替代，没有向真实 GA4 发送测试事件。本地预览捕获的外部请求为零；页面错误为零。
- Worker dry-run 与上传扫描通过。dry-run 只验证可构建的发布包，不等于部署。

忽略目录中的本地证据：`evidence/homepage-fourth-round/qa.json`、`evidence/homepage-fourth-round-regression/qa.json`、`.local/round4-image-report.json` 及对应截图。临时测试脚本在 `.local/round4-qa.py` 与 `.local/round4-regression.py`，不提交。

## 上线后的验证边界

合并和部署需另行执行。部署后才能在真实正式站确认 Google 请求及 GA4 报告收数；本轮离线测试不能替代真实接收验证。届时依次打开正式中英文首页、点击下载区/系统/文件/教程/大图，在 GA4 的“报告 → 实时”核对对应事件名，并确认本地预览仍无 Google 请求。

实现参考：[GA4 事件](https://developers.google.com/analytics/devguides/collection/ga4/events)、[GA4 配置参数](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)。
