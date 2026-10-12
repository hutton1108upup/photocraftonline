# EffectCraft 快速 MVP 验收

日期：2026-10-12。基线 `main`：`c5f99a0`。分支：`codex/effectcraft-mvp`。

## 交付范围

1. 新增中英文 `/effectcraft-app`：产品身份、alpha 状态、官方下载、Windows 架构和包类型、Mac/Linux 安装概览、Launcher 区别、原生样例、页面内 AE 对比、源码与许可证、测试范围和 FAQ。
2. 新增中英文 `/effectcraft/tutorial`：以已验证的 Windows x64 CPU CLI 流程为主，下载项目、读取关键帧、修改末端、另存、重新读取与 GIF/PNG 导出。桌面操作只提供官方文档参考，明确未做 GUI 验收。
3. 提供原创 `first-motion.ecproj`、真实首尾 PNG 和 48 帧 GIF。合成 640 × 360、24 fps、2 秒，Background 与 Moving Block 两个纯色图层，不依赖字体或外部媒体。不是 AE 模板库。
4. 接入 Craft 目录、首页相关工具入口、共用中英文页头和页脚；产品页三级、教程四级面包屑和 BreadcrumbList；路由、源文件哈希、canonical、hreflang、语言切换与 sitemap。
5. 本地服务补充 GIF MIME；README 更新 44 页与编辑位置。原始 PhotoCraft 引擎、依赖、统计、DNS 和部署配置未改动。

本轮未扩展快捷键大全、模板库或独立比较页，没有新建站点或在正式站托管 EffectCraft 引擎。

## 包来源与实际运行

官方版本：EffectCraft v0.8.0。Windows x64 便携 ZIP：64,143,091 字节。

SHA256：`02fb44910957160b92c8bca8f9e04cdf9beb74a4a5d7adac315f768b8be1b0d2`。实际下载同时匹配 GitHub release asset digest 与同发布 SHA256SUMS。

使用包内 CLI 创建本站原创合成和两个线性位置关键帧：第 0 秒 `[80,180,0]`，第 1.5 秒 `[560,180,0]`。保存原生项目后，新的 CLI 进程重新读取并确认尺寸、帧率、两层和两键。

原始项目导出首尾 PNG 和 48 帧 GIF。捆绑 Python/Pillow 验证 640 × 360，首帧黄色方块在 x=80，末端帧在 x=560，背景 RGB `(22,78,71)`，方块 RGB `(246,207,101)`。

页面中的六条 PowerShell 命令在官方包文件夹逐条原样执行：

1. `info` 读取原生样例。
2. `get` 读取末端关键帧。
3. `set` 将 x=560 改为 x=500，并 `--save-as` 另存 `first-motion-edited.ecproj`。
4. 新进程重新读取保存后的新项目，末端为 x=500，原始文件哈希不变。
5. 导出修改后的 48 帧 GIF。
6. 导出修改后 PNG，像素确认方块中心在 x=500，x=560 为背景。

这些证据只支持简单 CPU CLI 流程，不支持全部编码器、复杂效果、字体、音频、3D、Adobe 功能对等或专业迁移结论。

## 官方 Web 构建限制

为尝试实际界面验收，本地下载官方 Web ZIP（18,322,535 字节），SHA256 为 `59426cdd519ea1480215a58158ec0b36a31e6a1163ddd8715f3869caf509069d`，匹配发布 digest。

在隔离的临时 localhost:4202 服务和空白会话中，Chrome 出现 `The graphics device was lost`，按官方提示重载一次仍相同。未修改图形安全设置或原始引擎，没有把此流程写成通过。临时页和本任务服务已关闭。错误截图仅保存在本地 `evidence/effectcraft-web-gpu-lost.png`。

## 网站验收

- `npm.cmd run build:production`：44 页。
- `npm.cmd run check:production`：108 文件，27,571,207 字节；域名、索引、结构化数据、内链、sitemap 和原始引擎检查通过。
- `npm.cmd run check`：44 路由、50 资源、1,670 内链；原始编辑器 24,710,609 字节与基准哈希不变。
- 附加检查：44 页无重复 ID，334 个锚点有效；20 个具体发布文件链接均在核对的 v0.8.0 元数据中；32 条 sitemap 路由；新页 canonical、双语 hreflang 和面包屑正确。
- Chrome 中英文首页、工具目录、EffectCraft 产品与教程，共 8 页 × 1440px/390px = 16 次布局检查：单 H1、五组导航、无整页横向溢出。
- 原生项目实际下载到浏览器 Downloads，哈希与仓库文件一致；GIF MIME 为 image/gif，预览可展开且图片完整加载。
- 教程语言切换保留嵌套路径；EffectCraft 菜单、当前位置、手机 Escape 关闭及对比表方向键滚动通过。
- 本站页面未记录脚本警告或错误；官方引擎页的失败单独列在上节。
- `git diff --check` 通过；提交前明确暂存文件清单并运行上传凭据扫描。

本地命令重跑、下载包、Web 构建、临时工具、截图和测试 JSON 均在 `.local/` 或 `evidence/`，不会提交或部署。公开资源只有原创练习项目与实际渲染结果。

## 本地查看

| 页面 | 英文 | 中文 |
| --- | --- | --- |
| 产品、下载与 AE 对比 | <http://localhost:4200/effectcraft-app> | <http://localhost:4200/zh/effectcraft-app> |
| CLI 入门教程 | <http://localhost:4200/effectcraft/tutorial> | <http://localhost:4200/zh/effectcraft/tutorial> |

重新启动时，在本工作树 PowerShell 依次执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
node scripts/server.mjs --production --port 4200
```

成功提示为 `Built 44 production pages`、`PASS production` 和 `PhotoCraft local preview: http://localhost:4200 (44 pages)`。失败停在对应步骤；端口占用先核对项目，不停止未知进程。

本轮授权截至 GitHub 提交，没有合并或正式部署；CI dry-run 不代表上线。

## 官方来源

- [EffectCraft 产品与下载](https://getartcraft.com/apps/effectcraft)
- [v0.8.0 发布](https://github.com/storytold/effectcraft/releases/tag/v0.8.0)、[同版 README](https://github.com/storytold/effectcraft/blob/v0.8.0/README.md)
- [已知缺口与兼容性](https://github.com/storytold/effectcraft/blob/v0.8.0/docs/gaps.md)
- [CLI 与自动化](https://github.com/storytold/effectcraft/blob/v0.8.0/docs/agents.md)
- [Adobe 动画基础](https://helpx.adobe.com/after-effects/using/animation-basics.html)
