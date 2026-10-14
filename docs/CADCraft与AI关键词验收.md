# CADCraft 与 AI Photoshop Clone 交付验收

核查日期：2026-10-14。此记录证明本地构建与测试，不等于 GitHub 合并或生产部署。

## 内容与导航

- 新增中英文 CADCraft 下载指南、图文教程、AutoCAD 对比、在线编辑入口、AI Photoshop Clone 专题，共 10 个地址。
- `/cadcraft-app`、`/cadcraft/tutorial`、`/cadcraft-vs-autocad`、`/ai-photoshop-clone` 及中文对应地址进入 sitemap。
- `/cadcraft/editor` 及中文入口保持 noindex；`/cadcraft-engine/` 有 robots 排除与 X-Robots-Tag。
- 首页、分组导航、移动菜单、页脚、Craft 目录和面包屑接入新页面；语言切换保持路径。
- PhotoCraft 下载快照更新至 v0.8.2。此前 v0.7.0 CLI 结果保留原日期与版本；本站 PhotoCraft 引擎仍为 `72921900975c7e6f`。
- AI 专题区分 AI 辅助开发、Agent 自动化、生成式修图，未声称本站有生成式填充。

## CADCraft 上游构建

来源：https://github.com/storytold/cadcraft/releases/tag/v0.6.2

- Windows x64 portable ZIP SHA256：`624f01d53407ed9078328a1ad10bbbde7656a83567e8a757654fbcba2cd97b9b`
- Web ZIP SHA256：`9d27c10b3c9101df894e44867bba46c644f23f7b4e05bd2c743762fb49509e7b`
- 两者均匹配同一发行版的 SHA256SUMS.txt。
- Web JS/WASM 未修改，哈希与大小登记在 `src/site-manifest.json`；WASM 为 20,807,938 字节。
- 保留包内 MIT、Apache-2.0、README、HOSTING，并补全同版本 NOTICE、ATTRIBUTION。
- 上游依赖与素材有各自许可证，完整声明保留在构建目录；本站没有重新授权上游商标。

## 实操证据

Windows x64 便携程序在隔离配置目录运行。通过官方应用控制接口执行命令与保存操作，截图由运行中的应用生成，未合成 GUI。该测试不等于鼠标、辅助功能或安装器验收。

1. 原创 DXF：100 × 60 多段线矩形、圆心 50,30 半径 10 的圆。
2. 运行 `CIRCLE 25,30 5`，增加第二个圆。
3. 运行 `-LAYER M ANNOTATION`，再按 Enter 结束图层命令；创建并切换标注图层。
4. 运行 `DIMLINEAR 0,0 100,0 0,-15` 和 `ZOOM E`，标注显示 100。
5. 保存新 DXF 并重开，保留一个多段线、两个圆、一个标注，当前图层 ANNOTATION，dirty=false。
6. CLI 将保存的 DXF 转为 DWG，CADCraft 自身重开后实体计数一致；从保存后的 DXF 导出 PNG。
7. 浏览器 Chromium 自动模式及 CPU 兼容模式：原始 DXF 导入、圆编辑、Ctrl+S 下载、Ctrl+O 重开通过，得到一个多段线、两个圆。
8. 站内 iframe 入口也通过打开样例和下载保存。

截图和练习文件在 `public/assets/cadcraft/`。DXF 是可编辑文件，PNG 仅为渲染结果。

限制：没有运行 AutoCAD 或 Photoshop 做同文件对照；没有验证 CADCraft MSI、其他架构、Mac/Linux 启动、复杂图纸、浏览器 DWG 往返和手机制图。对比页分别标注上游资料与本站样例。

## 本地自查

按项目终端执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
```

构建与生产检查通过：56 页，149 个文件，总计约 53.4 MB；单个公开文件不超过 25 MiB。

启动开发服务后执行 `npm.cmd run check`：56 条路由、75 个资源、2,534 个内链；原 PhotoCraft 与新增 CADCraft JS/WASM 哈希均保持。

专项检查通过：42 条 sitemap 地址、442 个页内锚点、唯一 H1/ID、双语 hreflang、对应 canonical、官方发行资产匹配、16 个桌面/手机内容视图无整页横向溢出、菜单与语言切换、iframe 下载。

本地专项结果与浏览器截图保存在忽略目录 `evidence/keyword-qa.json` 和 `evidence/keyword-*.png`，不上传测试机环境文件。

上游 index.html 保留包内原样（包括其空白行），同样登记哈希。自编写文件的 Git 差异空白检查通过；上游文件仅有原有行尾空白。
