# Craft 关键词与导航验收

日期：2026-10-12。基线 `main`：`b4fa0a2`。工作分支：`codex/craft-keywords-navigation`。

## 已完成内容

1. P1 下载总页：合并 download photocraft 意图，增加浏览器、独立安装包、Launcher、源码四类入口；区分桌面、CLI、Web ZIP 和 Source code ZIP。独立包继续使用已核对的 PhotoCraft v0.7.0，Launcher 有独立版本与最新发布入口。
2. P1 Windows：保留 MSI、便携包和架构选择，增加 Launcher 与独立安装的选择、更新和文档流程。没有声称测试了 Launcher 或 MSI 安装。
3. P1 工具目录：保留 `/artcraft-photocraft` 地址，更新标题、描述和 12 项任务/状态/平台/官方产品/源码表；增加 Launcher 选择，链接 VectorCraft 指南。
4. P1 GitHub：合并 storytold photocraft 与 photocraft rust 意图，增加命名空间、源码与安装包区别、构建前核对步骤；普通用户无需 Rust。
5. P1 VectorCraft：新增中英文 `/vectorcraft-app`，合并 app 与 github 两组意图，提供产品识别、包类型、下载、源码与许可证、任务比较和真实 CLI 样例。
6. P2 评估：新增中英文 `/getartcraft-review`。评估对象为 Crafting Apps 选择路径和有限 PhotoCraft / VectorCraft 样例；明确不是完整套件 GUI 评测或 ArtCraft AI 生成测试。提供测试方法、结果、限制、任务建议和来源，无综合评分或性能排名。
7. 导航：页头五组用途导航和突出编辑器按钮；手机同组结构；原生 details 支持 Enter/Space，增强 ArrowDown、Escape、外部点击、单组展开、同页跳转关闭和锚点当前位置更新。页脚改为五组。索引内页增加面包屑和 BreadcrumbList，首页保留工具目录与新页入口。
8. 新页面接入路由、源文件哈希、语言切换、canonical、hreflang 与生产 sitemap。没有建立同义词重复页面，也没有批量创建另外 10 个工具的薄页面。

## 未完成的独立条件

- P0 正式发布：本次公共探针仍显示 `8f5f048` / 26 页。具体 Cloudflare 登录账号与 Worker 授权尚待确认，本次未部署。构建、GitHub 提交或 CI dry-run 不代表上线。
- P2 `/photocraft/build-from-source`：PATH 和用户 `.cargo/bin` 均没有找到 Cargo/rustc。本次没有修改系统工具链或安装 Rust，因此没有实际编译证据；按“先实测后建页”的方案保留在待办，不发布声称构建通过的教程。已有 `/github#rust` 已丰富。
- 没有登录或使用 ArtCraft AI，没有模型生成、额度、计费测试；相关身份与官方资料分别标注。

## 实际测试

- `npm.cmd run build:production`：40 页。
- `npm.cmd run check:production`：100 文件，27,368,336 字节；域名、索引、内链、JSON-LD、sitemap 与原始引擎检查通过。
- 开发服务 `npm.cmd run check`：40 路由、46 资源、1,442 内链；原始编辑器 24,710,609 字节及基准哈希不变。
- 附加构建检查：40 页无重复 ID，290 个页内/跨页锚点有效，26 个面包屑结构化数据，28 条 sitemap 路由。
- 12 个官方产品页均返回成功且包含对应 storytold 仓库链接；固定版本许可证和 Cargo.toml 来源有效。
- Chrome 14 个相关中英文页面 × 1440px / 390px 共 28 次布局检查：单 H1、五组导航、无整页横向溢出；另检查 320 / 767 / 1023 / 1100px 导航断点。
- 手机菜单展开、组内 Escape 后保留外层菜单、再次 Escape 关闭并回焦、桌面 ArrowDown、同页选择后关闭、Mac 锚点唯一当前位置标记通过。
- VectorCraft 中英文往返与评测页语言切换保留 `#results` 通过；12 项目录表可键盘滚动；实际 PNG 输出成功加载。
- 浏览器没有记录警告或脚本错误。`git diff --check` 通过；提交前按明确文件清单扫描暂存区。

## VectorCraft 原始证据

官方文件：`vectorcraft-0.9.0-windows-x64-portable.zip`，84,355,725 字节。

SHA256：`474028c71d2ef045230d80e037cfe7e8745eeecd1a034412559e170859bb09ec`。同时匹配 GitHub 发布资产 digest 与同版本 SHA256SUMS。

在 Windows 11 x64 使用便携包中 `vectorcraft-cli.exe`：

1. 原创 `public/assets/vectorcraft/practice-shapes.svg` → `.vectorcraft`，无导入警告。
2. 读取原生文档：640 × 400，一画板、一图层、四路径。
3. 从原生文档导出 PNG 和 SVG，无警告；PNG 640 × 400。
4. 用捆绑 Python/Pillow 读取 PNG，四处 RGB 与样例一致：背景 `(22,78,71)`、矩形 `(245,240,220)`、圆 `(246,207,101)`、三角形 `(112,193,179)`。

真实输出作为 `public/assets/vectorcraft/practice-shapes-rendered.png` 展示。原生文档、导出 SVG、安装包、工具与浏览器证据保存在 `.local/`、`evidence/`，不提交 GitHub。没有 GUI、安装器、复杂 SVG/字体/效果或 Illustrator 文件往返测试。

## 本地审查

| 页面 | 英文 | 中文 |
| --- | --- | --- |
| 下载 | <http://localhost:4199/download> | <http://localhost:4199/zh/download> |
| Windows | <http://localhost:4199/download/windows> | <http://localhost:4199/zh/download/windows> |
| Craft 工具目录 | <http://localhost:4199/artcraft-photocraft> | <http://localhost:4199/zh/artcraft-photocraft> |
| GitHub | <http://localhost:4199/github> | <http://localhost:4199/zh/github> |
| VectorCraft | <http://localhost:4199/vectorcraft-app> | <http://localhost:4199/zh/vectorcraft-app> |
| 有限评测 | <http://localhost:4199/getartcraft-review> | <http://localhost:4199/zh/getartcraft-review> |

重新启动时，在当前工作树 PowerShell 依次执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
node scripts/server.mjs --production --port 4199
```

成功提示为 `Built 40 production pages`、`PASS production` 和 `PhotoCraft local preview: http://localhost:4199 (40 pages)`。失败停在对应步骤；端口占用先核对，不停止其他项目进程。

## 来源

- [官方 Crafting Apps 目录](https://getartcraft.com/apps)
- [PhotoCraft 官方产品页](https://getartcraft.com/apps/photocraft)、[v0.7.0 源码](https://github.com/storytold/photocraft/tree/v0.7.0)
- [VectorCraft 官方产品页](https://getartcraft.com/apps/vectorcraft)、[v0.9.0 发布](https://github.com/storytold/vectorcraft/releases/tag/v0.9.0)
- [Launcher 官方说明](https://github.com/storytold/craft-launcher)、[独立发布](https://github.com/storytold/craft-launcher/releases)
- [ArtCraft AI 仓库](https://github.com/storytold/artcraft)
