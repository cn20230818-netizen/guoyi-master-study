# Android 上架引导

最后更新：2026-04-14

## 先做什么

1. 先把网页版部署出去。
2. 记下两个公开 URL：
   - 隐私政策：`https://你的域名/privacy-policy.html`
   - 支持页：`https://你的域名/support.html`
3. 登录 Google Play Console。

## 第一步：在 Google Play Console 创建应用

官方参考：

- 创建应用与商店资料
  - https://support.google.com/googleplay/android-developer/answer/9859152

你需要填写：

- 应用名称：国医大师脑病学脉研习
- 默认语言：中文（简体）
- 应用类型：App
- 收费方式：按你的计划选择免费或付费

## 第二步：补齐 App content

官方参考：

- User Data / 隐私政策
  - https://support.google.com/googleplay/android-developer/answer/9888076
- Health Content and Services
  - https://support.google.com/googleplay/android-developer/answer/16679511?hl=en
- Health apps declaration
  - https://support.google.com/googleplay/android-developer/answer/14738291?hl=en

你要重点完成：

1. `Privacy policy`
   - 填写网页版部署后的 `privacy-policy.html` URL
2. `App access`
   - 当前版本通常选择 `All or some functionality is unrestricted`
3. `Ads`
   - 如果没有广告，选 `No`
4. `Content rating`
   - 按真实功能填写问卷
5. `Health apps declaration`
   - 这是必须项
   - 建议把应用定位为学习参考、文献教学辅助，不要勾选成面向患者自动诊疗

## 第三步：准备商店资料

需要上传：

- 应用图标
- 手机截图
- 功能简介
- 长描述
- 隐私政策 URL

项目内可直接参考：

- `docs/STORE_LISTING.md`

## 第四步：生成 Android 发布包

当前项目已经准备好 Expo / EAS 配置，但还没有登录账号。

先登录 Expo：

```bash
npx eas-cli@latest login
```

然后在项目目录执行：

```bash
npx eas-cli@latest build --platform android --profile production
```

如果你更偏向 Google Play 正式发布，优先选择生成 `AAB`。

## 第五步：上传到 Google Play

在 Play Console 中：

1. 进入 `Production` 或 `Closed testing`
2. 创建新版本
3. 上传 `.aab`
4. 填写版本说明
5. 提交审核

## 特别注意：新个人开发者账号

官方参考：

- Closed testing requirement
  - https://support.google.com/googleplay/android-developer/answer/14151465

如果你的 Google Play 个人开发者账号是 2023-11-13 之后创建的，首个正式发布前通常需要先完成 closed test。

## 这个项目当前还缺什么

- Expo / EAS 账号登录
- Google Play Console 账号登录
- 正式应用图标和截图
- 最终隐私政策 URL
- 真实支持邮箱 / 网站
- 若要实机调试，还需 Android SDK 或云构建流程

## 推荐你实际操作时按这个顺序来

1. 部署网页版
2. 替换隐私政策和支持页里的真实联系信息
3. 登录 Google Play Console 创建应用
4. 完成 App content 和 Health apps declaration
5. 登录 EAS 构建 Android AAB
6. 上传 AAB 到 Closed testing 或 Production
