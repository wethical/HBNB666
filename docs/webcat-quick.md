# CatNative / window.webcat 速查

> **CatNative**：WebCatX 自研原生桥接框架，页面通过 `window.webcat.*` 调用安卓能力，预览与打包 APK 一致，无需 import。
> 异步方法返回 Promise（`await`），失败 Reject；同步方法直接返回对象（成功 `{ok:true,...}`，失败 `{ok:false,error}`）。
> 完整表格与边界说明见 `docs/webcat-api.md`。

## fs —— 私有文件（path 相对私有根）
- `fs.readFile(path, encoding?)` → `{content}` 异步
- `fs.writeFile(path, content, encoding?)` → `{size}` 异步（自动建父目录）
- `fs.list(dir?)` → `{items:[{name,isDir,size,modified}]}` 异步
- `fs.delete(path)` 异步；`fs.mkdir(dir)` / `fs.exists(path)` / `fs.stat(path)` 同步
- `fs.openFile(path)` 同步；`fs.readAsset(path)` 异步（打包后=assets/webcat 只读）
- `fs.zip(source, targetZip)` / `fs.unzip(zipPath, outDir)` / `fs.move(source, target)` / `fs.copy(source, target)` 异步

## ext —— 公开文件（target="root" 绝对路径，需全盘权限；或 SAF handle）
- `ext.isFullAccess()` / `ext.requestFullAccess()` / `ext.revoke(handle)` 同步；`ext.pickDirectory()` 异步 → `{handle}`
- 异步：`ext.list(target,path?)` / `ext.readFile(target,path,encoding?)` / `ext.writeFile(target,path,content,encoding?)` / `ext.delete` / `ext.zip` / `ext.unzip` / `ext.move` / `ext.copy`
- 同步：`ext.mkdir(target,path)` / `ext.exists` / `ext.stat` / `ext.openFile`
- 例：`ext.writeFile("root","/storage/emulated/0/Download/a.txt","hi")`；SAF 模式：`ext.writeFile(handle,"data.json","{}")`

## media —— 媒体保存 / 选择
- `media.saveImage(name, data, path?)` → `{uri?, path?}`（默认存相册 Pictures）
- `media.saveToDownload(name, data, path?)` → 默认存 Download
- `media.save(name, data, path?)` 按扩展名自动选择相册/下载
  - `data`：裸 base64 / `data:image/png;base64,...` / http(s) URL（自动下载）
  - `path` 省略=默认集合；非 `/` 开头=该集合下子目录（如 `myapp/cards`）；`/` 开头=绝对路径直接写文件（需全盘权限）
- `media.pickImage(format?, maxBytes?)` / `media.pickFile(mime?, format?, maxBytes?)` → `{name, mime, size, base64|uri|path}`
  - `format` 默认 `base64`；`uri` 返回 content uri；`path` 尽力解析本地绝对路径，解析失败会报错提示改用 uri/base64
  - `maxBytes` 默认 15MB（仅 base64 上限，超限请用 uri）

## camera / share / clipboard / screen / sys / phone / ui
- `camera.takePhoto(save?)` → `{name, size, base64}` 异步（免 CAMERA 权限；save=true 同时存相册）
- `share.text(text, title?)`；`share.file(source('fs'/'root'/handle), path, mime?)` 同步
- `clipboard.get()` / `clipboard.set(text)` 同步
- `screen.keepOn(on)`；`screen.setOrientation('auto'|'portrait'|'landscape'|'sensor')` 同步
- `sys.info()`；`sys.network()` → `{online, type:wifi/mobile/none}`；`sys.battery()` → `{level, charging}` 同步
- `phone.dial(number)` / `phone.sms(number, text?)` 同步（免权限跳系统）
- `ui.toast(msg, long?)` / `ui.vibrate(ms)` 同步（震动需打包勾选）

## app / permission / 其它
- `app.info()` 同步；`app.quit()`；`app.openFile(source, path)` 同步
- `app.install(source, path)` 同步（需允许安装未知来源）；`app.openAppSettings()` 同步
- `app.isInstalled(packageName)` 同步 → `{installed, appName?, versionName?, limited}`（limited=未勾选“应用列表”权限，可能误报未安装）
- `app.listApps()` 异步 → `{apps:[{packageName, appName, versionName, versionCode, isSystem}]}`（需打包勾选“应用列表”）
- `permission.check([perms])` 同步；`permission.request([perms])` 异步 → `{granted[], denied[], undeclared[]}`
- `contacts.list()` 异步；`location.get()` 异步；`browser.open(url)` 同步；`qq.openProfile(qq)` / `qq.openGroup(qq)` 同步
- `download.download(url, source('fs'/'root'/handle), path)` 异步 → `{path, size}`

## 易错示例
```js
// 图片 dataURL 存到相册子目录
await webcat.media.saveImage("card.png", canvas.toDataURL(), "myapp/cards");
// 选一张图，默认转 base64 供上传
const { name, base64 } = await webcat.media.pickImage();
// 选任意文件并要本地绝对路径
const { path } = await webcat.media.pickFile("*/*", "path");
// 分享私有文件
webcat.share.file("fs", "backup.zip");
// 分享公开绝对路径文件（需已开全盘权限）
webcat.share.file("root", "/storage/emulated/0/Download/a.pdf", "application/pdf");
```

## 原生网络 / 上传 / 流式下载（新增）
- `network.request({method,url,headers,body,timeout?,returnBase64?})` → `{ok,status,body}`（异步，无 CORS；body 可用 `base64:` 前缀）
- `network.upload({url,method?,headers?,fieldName?,files:[{source:'fs'/'root'/handle,path,name?}],fields?,onProgress})` → `{ok,status,body}`（异步 multipart，已知路径原生直传；进度回调 `onProgress({loaded,total?})`）
- `download.stream({url,source,path,headers?,onProgress})` → `{ok,path,size}`（异步，带进度）

## app 启动增强（新增）
- `app.launchPackage(packageName)`（同步，按包名打开；打包勾选“应用列表”最准）
- `app.openUri(uri)`（同步，任意 scheme/url）

## 音频播放（新增）
- `audio.play({url|source,path,volume?,seek?})`（异步，播完 resolve {end:true}）
- `audio.stop()/pause()/resume()/setVolume(0~1)/seek(ms)`（异步）
- `audio.isSupported()`（同步）；本地文件支持 fs/root/SAF，也支持 http(s) URL
- 说明：网页 `<audio>/<video>` 现默认允许自动播放（两端已设 setMediaPlaybackRequiresUserGesture(false)）

## 文字转语音 TTS（新增，无需权限）
- `tts.isSupported()`（同步）→ `{supported, speaking}`
- `tts.speak(text, {lang?,rate?,pitch?,volume?,queue?})`（异步，读完 resolve `{end:true}`；`queue:true` 追加不打断）
- `tts.stop()` / `tts.pause()` / `tts.resume()`（异步；系统 TTS 无原生暂停，pause 等价停止，resume 从头播放最近一次内容）

## 状态栏（新增）
- `statusBar.setColor(color, darkIcon?)`（同步；`darkIcon` 省略时按亮度自动判断）
- `statusBar.setDarkIcon(darkIcon)`（同步；true=深色图标）
- `statusBar.hide()` / `statusBar.show()`（同步，只隐藏状态栏）
- `statusBar.setAdaptive(enabled)`（同步，别名 `setOverlay`；true=内容延伸到状态栏下/沉浸，false=自动避让）
- `statusBar.height()`（同步）→ `{height, density}`，网页可据此加 padding

## 录音（新增）
- `record.start({source:'fs'/'root'/handle,path?,format?:'aac'|'amr'})`（异步；需打包勾选“录音/麦克风”；缺省 fs `records/rec_时间戳.*`）
- `record.stop()` → `{ok,path,size,durationMs,format}`；`record.cancel()` 丢弃；`record.state()`（同步）

## 扫码（新增）
- `scan.scan()` → `{ok,text,format}`（实时扫码；需打包勾选“相机”，预览返回引导）
- `scan.decodeImage({uri|base64|source,path})` → `{ok,text}`（识别图片中的码）
- `scan.generate(text,size?)` → `{ok,base64}`（生成二维码 PNG）

## 页面窗口 / 会话共享（新增）
- `page.open({url|path, params?})`：打开新页面窗口（path 相对当前网页根，或 http(s)/file 绝对）
- `page.params()`：本页收到的参数；`page.end()`：关闭当前页面
- `store.set(key,value)/get(key)/remove(key)/keys()`：会话级整 App 共享变量（仅内存，App 退出即清）


## 安全限制（新增）
- 网页不可访问 /WebCatX/project 与 /WebCatX/cache：ext.list 返回空列表，其它读/写/删/开/分享操作返回 路径受保护；SAF 授权目录不受限。
