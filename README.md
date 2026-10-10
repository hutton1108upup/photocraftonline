# Free PhotoCraft Online

`https://freephotocraft.online` 的网站源码与 Cloudflare Workers 静态部署配置。
基于原公开 PhotoCraft Online 页面复刻，保留未修改的 PhotoCraft WebAssembly 编辑器。
还原两种语言、首页、编辑器、下载、开源页、关于、隐私、条款、博客列表及两篇文章，新增中英文入门教程、Photoshop 对比及故障帮助，共 26 个页面。

## 打开本地网站

1. 在本项目文件夹双击 **启动本地预览.cmd**，保留弹出的终端窗口。
2. 在 Chrome 打开 <http://localhost:5173>；中文首页是 <http://localhost:5173/zh>。
3. 终端看到 `PhotoCraft local development` 且首页显示 `Free PhotoCraft Online Editor`，表示启动成功。
4. 修改 `src` 中的文件并保存，浏览器会自动刷新。关闭终端窗口或按 `Ctrl+C` 停止服务。

也可以在本目录的 PowerShell 依次执行：

```powershell
npm.cmd ci
npm.cmd run dev
```

需要 Node.js 20 或更新版本。首次克隆后在项目根目录执行 `npm.cmd ci`。
网站运行不依赖第三方 npm 包，`wrangler` 是固定版本的 Cloudflare 部署开发工具。
如果显示 `Port 5173 is occupied`，先停止这一轮启动：本项目不会自动占用别的端口。已有本项目服务可直接访问；如果端口属于其他项目，可以明确使用 `npm.cmd run dev -- --port 5180`，再打开 <http://localhost:5180>。

## 在哪里修改

| 要修改的内容 | 文件 |
| --- | --- |
| 英文首页文案、布局、图片 | `src/pages/en/index.html` |
| 中文首页 | `src/pages/zh/index.html` |
| 下载页面 | `src/pages/en/download.html`、`src/pages/zh/download.html` |
| 入门教程 | `src/pages/en/tutorial.html`、`src/pages/zh/tutorial.html` |
| Photoshop 对比 | `src/pages/en/photocraft-vs-photoshop.html`、`src/pages/zh/photocraft-vs-photoshop.html` |
| 加载帮助 | `src/pages/en/help/photocraft-not-loading.html`、`src/pages/zh/help/photocraft-not-loading.html` |
| 编辑器加载状态 | `src/scripts/editor-status.js` |
| 开源说明 | `src/pages/en/github.html`、`src/pages/zh/github.html` |
| 关于、隐私、条款 | 各语言目录下的 `about.html`、`privacy-policy.html`、`terms-of-service.html` |
| 博客列表 | `src/pages/en/blog.html`、`src/pages/zh/blog.html` |
| 博客文章 | `src/pages/en/blog/`、`src/pages/zh/blog/` |
| 共用导航与页脚 | `src/partials/en/`、`src/partials/zh/` 中的 `header.html`、`footer.html` |
| 颜色、字号、间距等样式调整 | `src/styles/custom.css`，在原样式后加载 |
| FAQ、手机菜单、语言切换、平台推荐交互 | `src/scripts/site.js` |
| 系统主题跟随 | `src/scripts/theme.js` |
| 原始图片 | `public/imgs/`；原样响应式图片在 `public/assets/images/` |
| 原版编辑器 | `public/editor-app/`，iframe 从同一本地服务器加载 |
| 页面文字字典 | `src/content/en.json`、`zh.json`；大部分页面文案已落在 HTML，改文案请修改 HTML |

例如：在编辑器中打开 `src/pages/en/index.html`，搜索 `Open images, work with layers`，只替换对应 `<p>` 内的文字，按 `Ctrl+S` 保存。返回本地浏览器即可看到新文案；原线上网站不会改变。
页面用原站的 Tailwind 类名，原始 CSS 已包含现有类。新增原站没有的样式请写在 `custom.css`，避免加了新类却没有对应 CSS。

## 构建与检查

保持开发服务器运行，另开本目录的 PowerShell：

```powershell
npm.cmd run check
npm.cmd run audit:upload
npm.cmd run build:production
npm.cmd run check:production
npm.cmd run deploy:dry-run
```

检查成功显示 `PASS`；构建成功显示 `Built 26 production pages`，输出位于 `dist/`。
如需检查构建后的页面，执行 `npm.cmd run preview`，打开 <http://localhost:4173>。
`npm.cmd run build` 生成禁止索引的本地构建，正式上线使用 `build:production`。
生产构建设置新域名 canonical 与 sitemap；编辑器和模板博客保持 noindex。
详细设置见 [Cloudflare 部署说明](docs/Cloudflare部署.md) 和 [上传审查](docs/上传审查.md)。

## 还原方式与边界

- 页面保留原站公开 HTML、CSS、字体、原图及响应式图片，重新实现所需的浏览器交互。源文件可以独立编辑；不依赖线上 Next.js 服务，不是把整站 iframe 嵌入。
- 原站属于 Next.js 应用；公开网页无法恢复它的完整 TypeScript/React 源码、数据库、部署配置或私人账号功能。本项目是可编辑的独立复刻，不能当作原 Git 仓库的完整恢复。
- 编辑器的 JavaScript 和 WebAssembly 原始文件保持原版；可以在本地运行并处理图片。编辑器内部是 Rust/egui 绘制的界面，若要改内部工具逻辑，需要上游 Rust 源码和单独构建。
- 编辑器需要浏览器与 GPU 支持，建议使用桌面 Chrome/Edge。`localhost` 属于浏览器安全上下文。原站已有的引擎限制继续存在。
- 导航、页面链接和编辑器都指向本地；GitHub Releases、上游官网和编辑器内的社区链接仍指向相应外部网站，与原站一致。
- 删除线上 Google Analytics 初始化及 Next.js 客户端代码；不在本地访问时向生产统计上报。不新增同意弹窗。
- 首页保留现有布局；新教程、对比、故障帮助、下载及法律页提供中英文版本。模板博客保持 noindex。法律页描述当前本站行为，不复用账号与支付模板。
- `src/site-manifest.json` 记录构建所需路由、资源 URL、字节数及 SHA-256。
- 原开发目录的 `reference/`、`evidence/`、本地基准采集工具与日志仅供本地对照，不进入 GitHub 或部署。
- 第三方许可见 [声明](THIRD-PARTY-NOTICES.md) 和 `public/licenses/`。

生产域名和索引范围在 `site.config.json`，Cloudflare 配置在 `wrangler.jsonc`。
