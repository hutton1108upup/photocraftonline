# SEO 第一批内页优化：本地验收

日期：2026-10-19。范围：中英文共 12 个现有页面，没有新增路由。
本记录描述本地修改、构建与预览验收。GitHub 提交和审查状态以关联 PR 为准；本次发布范围为创建 PR，不合并、不部署。

## 页面范围

- `/solidcraft/download`、`/solidcraft-app`：更新 v0.16.2 下载与当前仓库，补充包类型、Windows 启动、SHA256、旧版升级和样例成功检查；旧 v0.12.0 建模案例保留原日期和版本。
- `/cadcraft/tutorial`、`/cadcraft-app`：补基础操作、坐标、输入位置、卡点与成功标志；产品页增加明确的新手教程入口。标注图层命令的额外 Enter 操作放在正文中，不再混入可复制命令。
- `/`：在现有编辑入口附近补保存方式及打不开的帮助链接，保持首页定位。
- `/help/photocraft-not-loading`：区分浏览器启动、编辑器资源下载、单个文件和桌面程序问题，逐项提供成功标志。
- 以上页面均有对应 `/zh` 版本；已有网址和索引范围保留。

## 真实运行与截图

1. SolidCraft v0.16.2 Windows x64 Portable ZIP 从 `tangency-labs/solidcraft` 官方发行版下载；实际 SHA256 同时匹配 GitHub 资产 digest 和该发行版 SHA256SUMS.txt。
2. 实际启动 v0.16.2 原生应用，通过官方本机控制接口打开本站 v0.12.0 的 60 mm 安装板样例。测得一个实体及 60 × 30 × 4 mm 包围盒；原生窗口截图包含版本和两个孔。测试使用独立的任务配置目录。
3. CADCraft 仍使用本站 v0.6.2 Web 引擎。在本地 Chromium CPU 模式中打开原始 DXF，输入 `CIRCLE 25,30 5`，保存下载并重开。检查导出的 DXF 含一个 LWPOLYLINE、两个 CIRCLE。取得打开、编辑后、重开三张实际画面。
4. PhotoCraft 仅在测试浏览器中隐藏 `navigator.gpu`，重现现有 wrapper 的 WebGPU 缺失提示并截图。该测试不是生产故障记录，不修改引擎或生产能力。

五张新截图在 `public/assets/seo-guides/`；尺寸、摘要和验证结果见 `docs/seo-first-batch-verification.json`。
原始测试脚本、运行记录和页面截图在忽略目录 `.local/seo-first-batch/`。

## 验收与范围限制

- 生产构建及结构检查通过：74 页；本地路由、资源及内链检查通过。
- 12 个页面在 1440 px 和 390 px 两个窗口宽度检查标题、单 H1、canonical、图片解码、菜单、语言切换和整页溢出；核对本批页面的 120 个锚点。
- 新的 SolidCraft 直接下载 URL 与官方 v0.16.2 资产列表逐项对应。
- 公共 PhotoCraft/CADCraft JS、WASM 和状态脚本没有改动；不将新版上游的 fallback 或功能描述成本站旧构建已经支持。
- 没有测试 SolidCraft MSI 安装、Mac/Linux 启动、新版完整建模或旧脚本全量兼容；没有把旧教程截图改称新版验证。
- 没有验证所有 PSD、复杂 CAD 图纸、DWG 浏览器往返或手机制图。

## 主要来源

- https://github.com/tangency-labs/solidcraft/releases/tag/v0.16.2
- https://github.com/tangency-labs/solidcraft/releases/tag/v0.16.0
- https://docs.solidcraft.io/guide/getting-started.html
- https://github.com/tangency-labs/solidcraft/blob/v0.16.2/docs/compatibility.md
- https://github.com/storytold/cadcraft/tree/v0.6.2
