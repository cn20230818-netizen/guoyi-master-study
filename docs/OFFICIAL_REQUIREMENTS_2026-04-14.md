# 2026-04-14 官方上架要求核对

以下链接均为 2026-04-14 核对时可访问的官方页面。

## Apple App Store

### 1. 隐私政策 URL 必填

官方来源：

- Apple App Store Connect Help: Manage app privacy
  - https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Apple App Store Connect Reference: App information
  - https://developer.apple.com/help/app-store-connect/reference/app-information/app-information

对本项目的影响：

- iOS 上架必须提供 Privacy Policy URL。
- App Store Connect 还需要填写 App Privacy 数据处理申报。
- 现在仓库里只有隐私政策草案，没有正式公开 URL。

### 2. 应用内也要能访问隐私政策

官方来源：

- Apple App Review Guidelines
  - https://developer.apple.com/app-store/review/guidelines

对本项目的影响：

- 应用内必须以易于访问的方式呈现隐私政策。
- 当前移动端已经加入了“隐私与审核说明”入口，但正式上架前仍应接入真实政策 URL。

### 3. 中国大陆区还可能需要 ICP 等材料

官方来源：

- Apple App Store Connect Reference: App information
  - https://developer.apple.com/help/app-store-connect/reference/app-information/app-information
- Apple App Store Connect Help: View Mainland China compliance information
  - https://developer.apple.com/help/app-store-connect/manage-compliance-information/view-mainland-china-compliance-information/

对本项目的影响：

- 如果计划在中国大陆区上架，需在 App Store Connect 检查 China mainland 合规信息。
- 某些应用还需要 ICP Filing Number 或其他支持材料。
- 若开发者主体在中国大陆，Apple 还会显示和核验主体信息。

### 4. 需要回答加密合规问题

官方来源：

- Determine and upload app encryption documentation
  - https://developer.apple.com/help/app-store-connect/manage-app-information/determine-and-upload-app-encryption-documentation

对本项目的影响：

- 虽然当前 `app.json` 已设置 `ITSAppUsesNonExemptEncryption` 为 `false`，但正式提交时仍要在 App Store Connect 回答相关问题。

## Google Play

### 1. 隐私政策为必填，且应用内也要有

官方来源：

- Google Play Console Help: User Data
  - https://support.google.com/googleplay/android-developer/answer/9888076

对本项目的影响：

- Google Play 要求在 Play Console 指定字段中填写隐私政策链接。
- 同时要求应用内也有隐私政策链接或文本。
- 隐私政策必须是公开可访问、非 PDF、非地理封锁、不可编辑的 URL。
- 当前仓库中仅有 Markdown 草案，还没有公开 URL。

### 2. 健康类应用必须完成 Health apps declaration

官方来源：

- Google Play Console Help: Health Content and Services
  - https://support.google.com/googleplay/android-developer/answer/16679511?hl=en
- Google Play Console Help: Provide information for the Health apps declaration form
  - https://support.google.com/googleplay/android-developer/answer/14738291?hl=en

对本项目的影响：

- 这个应用提供健康相关信息与交互式路径，因此属于需要完成 Health apps declaration 的范围。
- Google 明确要求所有已发布应用都提交准确的 health apps declaration，包括 closed testing、open testing、production。

### 3. 新个人开发者账号发布前要先做封闭测试

官方来源：

- Google Play Console Help: Test your app for closed testing requirements
  - https://support.google.com/googleplay/android-developer/answer/14151465

对本项目的影响：

- 如果使用的是 2023-11-13 之后创建的个人开发者账号，首个正式发布前要满足 closed test 要求。
- 这会直接影响最早发布时间。

## 当前项目的实际阻塞项

### 已完成

- Expo / React Native 工程已建立
- 手机端界面与交互逻辑已完成
- Web / iOS / Android JS bundle 导出已通过
- `expo-doctor` 已通过

### 未完成且会阻塞真正提交

- 未登录 Expo / EAS
- 未登录 Apple Developer
- 未登录 Google Play Console
- 本机无完整 Xcode
- 本机无 Android SDK / adb / sdkmanager
- 无正式隐私政策 URL
- 无真实支持邮箱 / 支持网站
- 无正式商店截图、图标与审核演示材料
