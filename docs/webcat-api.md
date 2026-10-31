# CatNative / webcat 安卓能力桥接 —— API 参考

> **CatNative**（WebCatX 自研原生桥接框架）：项目页面通过全局对象 `window.webcat` 调用安卓能力（预览与打包 APK 均支持，**无需引入**）。同步方法直接返回对象；异步方法返回 Promise，用 `await`。失败：同步返回 `{ok:false,error}`，异步 Reject（Error.message）。

## webcat.fs —— 私有文件（应用私有目录，两端一致）
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `fs.readFile`(读取文件) | 异步 | path, encoding?('utf8'/'base64') | `{ok, content}` |
| `fs.writeFile`(写入文件) | 异步 | path, content, encoding? | `{ok, size}`（自动建父目录） |
| `fs.list`(列出目录) | 异步 | dir? | `{ok, items:[{name,isDir,size,modified}]}` |
| `fs.delete`(删除) | 异步 | path | `{ok}`（文件/空目录） |
| `fs.mkdir`(创建目录) | 同步 | dir | `{ok}` |
| `fs.exists`(判断存在) | 同步 | path | `{ok, exists, isDir}` |
| `fs.stat`(文件信息) | 同步 | path | `{ok, size, isDir, modified}` |
| `fs.readAsset`(读取项目文件) | 异步 | path（项目内相对） | `{ok, content}`（打包后只读） |
| `fs.openFile`(系统打开文件) | 同步 | path | `{ok}` |
| `fs.zip`(压缩) | 异步 | source, targetZip(.zip) | `{ok, size}` |
| `fs.unzip`(解压) | 异步 | zipPath, outDir | `{ok, count}` |
| `fs.move`(移动/重命名) | 异步 | source, target | `{ok}` |
| `fs.copy`(复制) | 异步 | source, target | `{ok}` |

## webcat.ext —— 公开文件（target=`"root"`全授权 / SAF handle）
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `ext.isFullAccess`(是否全授权) | 同步 | — | `{ok, granted}` |
| `ext.requestFullAccess`(开启全授权) | 同步 | — | `{ok}`（跳本应用设置） |
| `ext.pickDirectory`(选择目录) | 异步 | — | `{ok, handle}`（授权持久化） |
| `ext.revoke`(撤销授权) | 同步 | handle | `{ok}` |
| `ext.list`(列出) | 异步 | target, path? | `{ok, items}` |
| `ext.readFile`(读取) | 异步 | target, path, encoding? | `{ok, content}` |
| `ext.writeFile`(写入) | 异步 | target, path, content, encoding? | `{ok, size}` |
| `ext.delete`(删除) | 异步 | target, path | `{ok}` |
| `ext.mkdir`(建目录) | 同步 | target, path | `{ok}` |
| `ext.exists`(存在) | 同步 | target, path | `{ok, exists, isDir}` |
| `ext.stat`(信息) | 同步 | target, path | `{ok, size, isDir, modified}` |
| `ext.openFile`(系统打开) | 同步 | target, path | `{ok}` |
| `ext.zip`(压缩) | 异步 | target, source, targetZip | `{ok, size}` |
| `ext.unzip`(解压) | 异步 | target, zipPath, outDir | `{ok, count}` |
| `ext.move`(移动) | 异步 | target, source, dst | `{ok}` |
| `ext.copy`(复制) | 异步 | target, source, dst | `{ok}` |

> `target` 取 `"root"`（需"所有文件访问"，path 为绝对路径）或 SAF `handle`（path 相对授权目录）。

## webcat.app —— 应用
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `app.info`(应用信息) | 同步 | — | `{ok, packageName, versionName, versionCode, appName}` |
| `app.quit`(退出应用) | 同步 | — | `{ok}` |
| `app.openFile`(系统打开文件) | 同步 | source('fs'/'root'/handle), path | `{ok}` |

## webcat.qq —— QQ 跳转
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `qq.openProfile`(打开QQ名片) | 同步 | qq: QQ号 | `{ok, launched}` |
| `qq.openGroup`(打开QQ群) | 同步 | qq: 群号 | `{ok, launched}` |

## webcat.browser —— 系统浏览器
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `browser.open`(用浏览器打开网页) | 同步 | url | `{ok}` |

## webcat.clipboard —— 剪切板（同步）
| 接口(中文名) | 入参 | 出参 |
|---|---|---|
| `clipboard.get`(读取剪切板) | — | `{ok, text}` |
| `clipboard.set`(写入剪切板) | text | `{ok}` |

## webcat.sys —— 系统信息（同步）
| 接口(中文名) | 出参 |
|---|---|
| `sys.info`(系统信息) | `{ok, brand, model, androidVersion, sdkInt, screenWidth, screenHeight, density}` |

## webcat.permission —— 权限
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `permission.check`(检查权限) | 同步 | perms: string[] | `{ok, granted[], denied[], undeclared[]}` |
| `permission.request`(申请权限) | 异步 | perms: string[] | `{ok, granted[], denied[], undeclared[]}` |

> `undeclared` = 未声明权限（打包时未勾选 / webcat 不支持）→ 提示"打包时勾选"或"系统授予"。特殊权限 MANAGE 走 `ext.requestFullAccess`。

## webcat.contacts —— 通讯录
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `contacts.list`(读取通讯录) | 异步 | — | `{ok, contacts:[{name, phones:[]}]}`（需 READ_CONTACTS，打包勾选） |

## webcat.location —— 定位
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `location.get`(获取定位) | 异步 | — | `{ok, latitude, longitude, accuracy, provider}`（需定位权限，打包勾选） |

## webcat.download —— 下载
| 接口(中文名) | 类型 | 入参 | 出参 |
|---|---|---|---|
| `download.download`(下载文件) | 异步 | url, source('fs'/'root'/handle), path | `{ok, path, size}` |

## webcat.ui —— 提示（同步）
| 接口(中文名) | 入参 | 出参 |
|---|---|---|
| `ui.toast`(提示) | msg, long? | `{ok}` |

## 示例
```js
// 私有文件
await webcat.fs.writeFile("data.json", JSON.stringify({a:1}));
const { content } = await webcat.fs.readFile("data.json");

// 压缩 / 解压（私有）
await webcat.fs.zip("js", "backup.zip");
await webcat.fs.unzip("backup.zip", "restore");

// 剪切板 / 系统信息（同步）
const { text } = webcat.clipboard.get();
const info = webcat.sys.info();

// 权限（异步）
const r = await webcat.permission.request(["android.permission.CAMERA"]);
if (r.undeclared.length) { webcat.ui.toast("该权限未在打包时勾选"); }

// 外部跳转
webcat.qq.openProfile("123456");           // 打开QQ名片
webcat.browser.open("https://example.com");// 浏览器打开

// 下载到私有目录
await webcat.download.download("https://x.com/a.png", "fs", "img/a.png");

// 通讯录 / 定位
const { contacts } = await webcat.contacts.list();
const loc = await webcat.location.get();

// 公开目录
if (webcat.ext.isFullAccess().granted) {
  await webcat.ext.writeFile("root", "/storage/emulated/0/Download/a.txt", "hi");
} else {
  webcat.ext.requestFullAccess();
}
const { handle } = await webcat.ext.pickDirectory();
await webcat.ext.writeFile(handle, "data.json", "{}");
```

## 新增：媒体 / 相机 / 分享 / 系统（2026-09）

| 命名空间 | 接口 | 类型 | 入参 | 出参 / 说明 |
|---|---|---|---|---|
| media | `saveImage`(存相册) | 异步 | name, data, path? | `{ok, uri?, path?}`；path 以 `/` 开头=绝对路径写文件；否则 Pictures 子目录；缺省相册 |
| media | `saveToDownload`(存下载) | 异步 | name, data, path? | 同上，集合 Download |
| media | `save`(自动) | 异步 | name, data, path? | 按扩展名自动图片→相册、其它→Download |
| media | `pickImage`(选图) | 异步 | format?, maxBytes? | `{ok,name,mime,size,base64|uri|path}`；format=base64(默认)/uri/path，path 尽力解析本地绝对路径 |
| media | `pickFile`(选文件) | 异步 | mime?, format?, maxBytes? | 同上，mime 默认 `*/*` |
| camera | `takePhoto` | 异步 | save? | 调系统相机（免 CAMERA 权限）；`{ok,name,size,base64}`；save=true 同时存相册 |
| share | `text`(分享文本) | 同步 | text, title? | 系统分享面板 |
| share | `file`(分享文件) | 同步 | source('fs'/'root'/handle), path, mime? | fs/root 走 FileProvider |
| screen | `keepOn`(屏幕常亮) | 同步 | on | 窗口 `FLAG_KEEP_SCREEN_ON` 开/关 |
| screen | `setOrientation` | 同步 | mode | auto/portrait/landscape/sensor |
| sys | `network` | 同步 | — | `{ok, online, type:wifi/mobile/none}` |
| sys | `battery` | 同步 | — | `{ok, level, charging}` |
| phone | `dial`(拨号) | 同步 | number | 免权限跳拨号盘 |
| phone | `sms`(发短信) | 同步 | number, text? | 免权限跳短信 |
| app | `install`(安装) | 同步 | source, path | 需允许未知来源；SAF 先复制到 cache |
| app | `openAppSettings` | 同步 | — | 跳本应用设置 |
| app | `isInstalled` | 同步 | packageName | `{ok, installed, appName?, versionName?, limited}` |
| app | `listApps` | 异步 | — | 需打包勾选 QUERY_ALL_PACKAGES；`{ok, apps:[{packageName,appName,versionName,versionCode,isSystem}]}` |
| ui | `vibrate` | 同步 | ms | 需打包勾选“震动”（VIBRATE） |

- `data` 支持：`data:image/png;base64,...`、裸 base64、或 http(s) URL（自动下载）。
- 选择器 `maxBytes` 默认 15MB（仅 base64 生效）；超限报错请改用 `format=uri`。
- 预览端未打包声明的能力（vibrate / app.listApps 等）返回引导性错误，需在打包权限清单勾选后使用。

## 新增：原生网络 / 上传 / 流式下载 / 应用启动（2026-09）
| 命名空间 | 接口 | 类型 | 入参/说明 | 返回 |
|---|---|---|---|---|
| network | `request` | 异步 | `{method,url,headers,body,timeout?,returnBase64?}` | `{ok,status,body}`；无 CORS；body 支持 `base64:` 前缀 |
| network | `upload` | 异步 | `{url,method?,headers?,fieldName?,files:[{source:'fs'/'root'/handle,path,name?}],fields?,onProgress}` | `{ok,status,body}`；multipart 已知路径原生上传 |
| download | `stream` | 异步 | `{url,source,path,headers?,onProgress}` | `{ok,path,size}`；带进度（中间帧 `{progress:{loaded,total}}`） |
| app | `launchPackage` | 同步 | packageName | `{ok,launched}`；未装/不可见返回提示（打包勾选“应用列表”更准） |
| app | `openUri` | 同步 | uri | `{ok,launched}` |

## 新增：audio 音频播放（2026-09）
- `audio.play({url|source,path,volume?,seek?})` 异步 → 播完 resolve `{ok,end:true}`；本地支持 fs/root/SAF，或 http(s)
- `audio.stop/pause/resume/setVolume(0~1)/seek(ms)` 异步 → `{ok}`
- `audio.isSupported()` 同步
- 两端 WebView 已开启 `setMediaPlaybackRequiresUserGesture(false)`，页面 audio/video 可自动播放

## 新增：tts 文字转语音（2026-09，无需权限）
| 接口 | 类型 | 入参 | 出参 / 说明 |
|---|---|---|---|
| `tts.isSupported` | 同步 | — | `{ok, supported, speaking}`；`supported`=系统是否有可用语音引擎 |
| `tts.speak` | 异步 | text, {lang?, rate?, pitch?, volume?, queue?} | 朗读文本，读完 resolve `{ok,end:true}`；`lang` 如 `"zh-CN"`；`rate/pitch` 默认 1；`volume` 0~1；`queue=true` 追加而非打断 |
| `tts.stop` | 异步 | — | `{ok}` 停止并结束当前朗读 |
| `tts.pause` | 异步 | — | `{ok}` 暂停（系统 TTS 无原生暂停，等价停止） |
| `tts.resume` | 异步 | — | `{ok}` 继续朗读最近一次内容（从头播放） |

```js
if (webcat.tts.isSupported().supported) {
  await webcat.tts.speak("你好，欢迎使用 WebCatX", { lang: "zh-CN", rate: 1.0, pitch: 1.0 });
}
```

## 新增：statusBar 状态栏（2026-09）
| 接口 | 类型 | 入参 | 出参 / 说明 |
|---|---|---|---|
| `statusBar.setColor` | 同步 | color, darkIcon? | 设置状态栏颜色（`#RRGGBB`/`#AARRGGBB` 或整数）；`darkIcon` 省略时按颜色亮度自动判断图标深浅 |
| `statusBar.setDarkIcon` | 同步 | darkIcon | `true`=深色图标（适配浅色状态栏），`false`=浅色图标 |
| `statusBar.hide` | 同步 | — | 隐藏状态栏（导航栏保留；窗口重新获得焦点时保持隐藏） |
| `statusBar.show` | 同步 | — | 显示状态栏 |
| `statusBar.setAdaptive` | 同步 | enabled | 内容是否延伸到状态栏下方：`true`=自适应沉浸（edge-to-edge），`false`=自动避让状态栏。别名 `statusBar.setOverlay` |
| `statusBar.height` | 同步 | — | `{ok, height, density}`：状态栏高度（px）与屏幕密度，方便网页自行加 `padding-top` |

```js
webcat.statusBar.setColor("#FF2C2E43");      // 顶栏同色
webcat.statusBar.setAdaptive(true);          // 内容延伸到状态栏下
const { height } = webcat.statusBar.height();
document.body.style.paddingTop = height + "px";
webcat.statusBar.hide();                     // 隐藏状态栏
```
> 说明：`setAdaptive` 作用于整个预览/打包窗口（含原生顶栏）；需要真正全屏沉浸时建议同时在项目配置里关闭顶栏。

## 新增：record 录音 / scan 扫码（2026-09）
- `record.start({source,path?,format?:'aac'|'amr'})` 异步 → `{ok,started,path}`；`record.stop()` → `{ok,path,size,durationMs,format}`；`record.cancel()`、`record.state()`（需打包勾选“录音/麦克风”）
- `scan.scan()` 异步 → `{ok,text,format}`（需打包勾选“相机”；预览返回引导）
- `scan.decodeImage({uri|base64|source,path})` 异步 → `{ok,text}`
- `scan.generate(text,size?)` 同步 → `{ok,base64}`

## 新增：page 页面窗口 / store 会话共享（2026-09）
- `page.open({url|path,params?})` 同步 → `{ok}`；`page.params()` 同步；`page.end()` 同步（关闭当前页）
- `store.set(key,value)` / `store.get(key)` / `store.remove(key)` / `store.keys()` 同步；会话级整 App 共享（仅内存）


## 安全限制（2026-09）
- CatNative 网页不可访问 WebCatX 自身目录（/WebCatX/project、/WebCatX/cache）：ext.list 命中返回空列表，其余命中返回 路径受保护不允许网页访问 WebCatX 目录；SAF 授权目录不受限。
