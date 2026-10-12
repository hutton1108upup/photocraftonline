# Cloudflare 部署

目标仓库：`hutton1108upup/photocraftonline`，目标分支：`main`。
目标 Worker：`freephotocraft-online`。
主域名：`https://freephotocraft.online`。
`www.freephotocraft.online` 永久重定向到主域名，保留路径及查询参数。

## 构建设置

这是静态网站及 WebAssembly，不是需要 OpenNext 适配器的 Next.js 应用。
本次用户选择 **直接上传静态文件，不新建 Token**，不连接 GitHub 自动部署。
GitHub Actions 负责质量检查；Cloudflare 从检查通过的生产构建发布。

本项目根目录执行 `npm.cmd run build:production`、`npm.cmd run check:production`。
随后在已确认的 Cloudflare 账户选择 `Create application → Upload your static files`，
上传 `dist` 目录，或上传仅包含 `dist` 内部文件的 ZIP（根目录必须直接有 `index.html`，
不能再包一层 `dist`）。核对界面文件清单与本次 `dist` 构建一致，项目命名为 `freephotocraft-online`。
在 `Advanced settings` 设置 Assets directory 为 `/`、HTML handling 为
`drop-trailing-slash`、Not found handling 为 `404-page`，再点击 `Deploy`。
后续更新进入此 Worker，点击 `New deployment` 上传新的生产包。

以下 Git 构建参数保留为将来可选方案，只有另行授权专用构建凭据时才使用：

| 设置 | 值 |
| --- | --- |
| Repository | `hutton1108upup/photocraftonline` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build:production` |
| Deploy command | `npx wrangler deploy` |
| Assets directory | `dist`，已经写入 `wrangler.jsonc` |

`package-lock.json` 固定部署工具版本。GitHub Actions 只做检查，不保存部署密钥。
Cloudflare 的 Git 集成、Worker 与域名必须属于用户确认的同一个 Cloudflare 账户。
正式写入前核对该账户；不要使用其他账户的 CLI 默认身份。

## 域名和 HTTPS

1. 在确认的 Cloudflare 账户中添加 `freephotocraft.online`，选择 Free 计划。
2. 记录 Cloudflare 实际分配的两个 Nameserver。
3. 在持有此域名的 Spaceship 注册商账户中，将域名的 Nameservers
   从原来的 `launch1.spaceship.net`、`launch2.spaceship.net` 改为上一步的实际值。
   这两个新值必须从当前 Zone 页面读取，不能猜。
4. 等待 Zone 显示 `Active`。在 Worker 的 `Settings → Domains & Routes`
   添加 Custom Domain：`freephotocraft.online`。
5. 在 Zone 的 `DNS → Records` 添加 `A`：Name `www`，IPv4 `192.0.2.0`，
   Proxy status `Proxied`，TTL `Auto`。这是重定向入口，不能改成 DNS only。
6. 使用 `Redirect from WWW to root` 模板，状态 `301`，保留查询参数。
7. 在 `SSL/TLS → Edge Certificates` 开启 `Always Use HTTPS`。
8. 分别验证 HTTPS 主域名正常、`www` 返回主域名重定向、HTTP 自动转 HTTPS。

账号确认、NS 修改与真实 DNS/TLS 验证是实际上线必需步骤。
部署成功或 workers.dev 可访问，不等于域名已经可用。

## 生产与本地差异

- 构建时替换 canonical、社交图片 URL 及站点域名文字。
- 可索引页面由 `site.config.json` 的 `indexablePages` 管理，包括产品、平台下载、源码、教程、对比、关系和帮助页；编辑器、法律页与模板博客保持 noindex。
- `sitemap.xml` 仅包含可索引的页面；本地预览始终禁止索引。
- `release.json` 记录构建时的 Git revision，便于核对部署的具体提交。
- 原版 WASM 保持 24,710,609 字节，小于 Cloudflare 单文件 25 MiB 限制。
- 编辑器入口通过 `<base href="/editor-app/">` 固定资源目录，避免无尾斜杠地址
  `/editor-app` 使原版相对 JS/WASM 路径指向网站根目录。
- 图片按真实 WebP 扩展名提供，WASM 以 `.wasm` 扩展名保证正确 MIME。

部署工具使用 Cloudflare 官方文档：
[Static Assets](https://developers.cloudflare.com/workers/static-assets/)、
[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。
