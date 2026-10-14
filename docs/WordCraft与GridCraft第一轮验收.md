# WordCraft / GridCraft 第一轮内容验收

日期：2026-10-14。基于已合并 PR #9 的 `main`（`3c8ab7a`）执行。此记录证明本地内容与网站验证，不代表正式部署或客户端兼容性测试。

## 已完成范围

新增四个内容地址：

- `/wordcraft-app`、`/zh/wordcraft-app`
- `/gridcraft-app`、`/zh/gridcraft-app`

每页包含身份消歧、v0.6.1 官方下载、系统与架构选择、安装说明、基础操作检查清单、文件格式、兼容性简表、AI 与本站托管边界、GitHub/许可证/社区及 FAQ。

WordCraft 内容围绕 DOCX 编辑、字体与排版、保存重开、PDF 导出、宏/插件/协作限制。GridCraft 内容围绕 XLSX、CSV/TSV、公式重算、格式保留、VBA 和 Power Query 边界。示例结果是用户核对目标，未声称在客户端实际执行。

首页新增办公工具资源卡；Craft 目录更新两行产品信息并新增办公工具区；主导航“更多 Craft 工具”按创作、工程、办公、实测记录分组，短桌面窗口可滚动。移动菜单、页脚、面包屑和语言切换接入新页。

第一轮没有新增 WordCraft/GridCraft 托管引擎、独立实测教程、独立比较页、模型服务、文件上传、统计脚本或主动弹窗。现有 PhotoCraft/CADCraft 引擎、其他版本实测与部署配置保持。

## 资料核对

2026-10-14 从 GitHub Release API 核对，两者 latest 均为 v0.6.1：

- https://github.com/storytold/wordcraft/releases/tag/v0.6.1
- https://github.com/storytold/gridcraft/releases/tag/v0.6.1

对应版本 README、兼容性文档和实际资产清单作为资料来源。上游清单与缺口表存在不同更新时间，不使用百分比宣称兼容，也不把声明当作本站实测。

32 个页面下载链接（双语累计）均匹配发行资产；包含 Windows x64 MSI/便携 ZIP、ARM64/x86 MSI、macOS Universal DMG、Linux x86_64 AppImage、Web ZIP、SHA256SUMS。

未下载安装包或执行二进制，未声称已验证 SHA256、安装器、GUI、文件往返、公式计算或 Microsoft Word/Excel 同文件对照。

## 本地验证

在仓库终端执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
```

构建通过：60 页、153 个静态文件，46 个 sitemap 地址。新增页面为 index/follow，canonical 指向生产域名对应地址；中英文和 x-default hreflang 完整，面包屑为“首页 → Craft 工具导航 → 产品指南”。编辑器和引擎索引规则保持。

开发服务运行时执行 `npm.cmd run check`，60 条路由、75 个资源、2,958 个内链通过；原 PhotoCraft 与 CADCraft 引擎哈希保持。

专项检查：

- 520 个页内锚点指向存在的 ID，没有重复 ID。
- 四个新页 H1、标题、描述、结构化数据、canonical、hreflang 与 sitemap 覆盖通过。
- 1440×1000、390×844、1100×640 三种尺寸，四个内容地址共 12 个视图通过；无整页横向溢出。
- 桌面/手机菜单、短窗口滚动、首页办公卡、目录办公区、页脚语言切换和下载按钮通过。
- 页面没有 JavaScript 异常；下载链接校验为发行元数据检查，浏览器未实际下载安装器。

本地结果及截图在忽略目录 `evidence/office-craft-qa.json`、`evidence/office-*.png`，不上传机器环境信息。

提交前执行工作树与暂存内容的 `audit:upload`，保留允许清单，排除 `.local`、`dist`、凭据和测试环境。
