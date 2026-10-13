# EffectCraft v0.9.2 内容与桌面教程验收

验收日期：2026-10-13。旧 `EffectCraft-MVP验收.md` 保留为 v0.8.0 历史记录。

## 修改范围

- 更新中英文 `effectcraft-app` 与 `effectcraft/tutorial` 共4页。
- 新增中英文 `effectcraft/desktop-tutorial` 共2页，配8张真实 Windows 桌面截图。
- AE 对比扩为12项：项目、模板、插件、关键帧、保存、输出、效果、3D、文字、系统与许可等；官方资料与本站测试分开标注，不提供速度或完整替代结论。
- 首页、桌面及手机共用导航、页脚、面包屑、语言切换与 sitemap 接入桌面教程。
- 原 PhotoCraft 编辑器引擎保持不变；WASM 24,710,609字节。

## 官方发布核验

- [v0.9.2发布](https://github.com/storytold/effectcraft/releases/tag/v0.9.2)，发布于2026-10-12T21:22:55Z。
- 实测程序包：`effectcraft-0.9.2-windows-x64-portable.zip`，65,738,563字节。
- SHA256：`1f6fbb3a348f1b12b15faa3bc2c78a079414f07454cc1402208793486e79bee4`，与 GitHub 资产 digest 和同版 SHA256SUMS 均一致。
- 官方产品页仍可能显示较旧下载版本；本站固定到同版 GitHub 文件，同时提供 latest 核对入口。

## 桌面实际操作

Windows 11 x64、v0.9.2便携版；中文菜单和部分英文面板。用真实鼠标/键盘输入完成：

1. 文件 → 打开项目，选择原始 `first-motion.ecproj`。
2. 选中 Moving Block，按P展开Position，检查两个关键帧。
3. 在0:00:01:12（24fps第36帧，1.5秒）把X从560改为500并按Enter。
4. 文件 → 另存为 → 另存为，保存 `desktop-motion.ecproj`。
5. 用打开项目重新读取保存文件，回到1.5秒确认Position仍为500,180。
6. 合成 → 添加到渲染队列；展开行，Best Settings、Animated GIF、Choose File设置输出，点击Render。
7. 等待Status=Done与Message: 1 of 1 done，检查实际输出文件。

原始项目保留。完成项目保存字段 `savedBy=0.9.2`，无外部字体、素材或本机路径依赖。保存项目发生在配置渲染队列前，避免把本机绝对输出路径写进可下载样例。

桌面 GIF 为640×360、48帧，像素检查首帧方块中心[80,180]，末帧[500,180]。首尾与原始 GIF 的[560,180]区分。程序曾提示低内存并缩小缓存，简单样例仍成功；没有据此宣称大型项目稳定。

## CLI 复测

在 v0.9.2 包中逐条重跑已刊登的6条 PowerShell 命令：info、get、set/另存、独立get/重开、render GIF、render-frame PNG；保存和末端500检查通过。原始 GIF/PNG 也在v0.9.2重新生成。

机器证据保存在忽略的 `evidence/effectcraft-v0.9.2-cli-replay.json`、`effectcraft-v0.9.2-output-checks.json` 与 `effectcraft-update-qa.json`；软件包、日志和临时脚本保存在忽略的 `.local`，不提交程序二进制。

## 验证方法与边界

在项目根目录执行：

```powershell
npm.cmd run build:production
npm.cmd run check:production
# 启动本项目开发服务器后，将 CHECK_BASE_URL 指向该端口
npm.cmd run check
npm.cmd run audit:upload
npm.cmd run deploy:dry-run
```

生产构建46页，34条可索引 sitemap 地址；全站本地检查覆盖46路由、60资源及1838内链。专项检查覆盖360锚点、20个与发布API一致的下载链接、每页H1、语言链接、面包屑、12行对比表、原生保存版本。静态生产检查与真实上线是两个步骤；只有正式域名 `release.json` 的 revision 与本次发布提交相同、原4页及新教程均200，才记录上线成功。

未测试：MSI、Launcher、Mac/Linux安装、新版Web交互、字体、音频、复杂效果、3D及全部编码器。v0.8.0 Web图形设备丢失仅属历史结果。未运行同机After Effects性能或画质对测。
