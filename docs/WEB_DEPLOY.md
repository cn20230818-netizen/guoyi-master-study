# 网页版部署说明

## 当前状态

本项目已经支持导出静态网页版。

- 主站入口：`dist/index.html`
- 隐私政策页：`dist/privacy-policy.html`
- 支持页：`dist/support.html`

## 本地导出

在项目目录运行：

```bash
npm run export:web
```

导出后会生成 `dist/` 目录，并自动把以下静态页面复制进去：

- `privacy-policy.html`
- `support.html`

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 9000 -d dist
```

然后访问：

- `http://127.0.0.1:9000/`
- `http://127.0.0.1:9000/privacy-policy.html`
- `http://127.0.0.1:9000/support.html`

## 推荐部署方式

### 方式 1：Netlify

- 项目已包含 `netlify.toml`
- 构建命令：`npm run export:web`
- 发布目录：`dist`

部署后可直接得到：

- 首页：`https://你的域名/`
- 隐私政策：`https://你的域名/privacy-policy.html`
- 支持页：`https://你的域名/support.html`

### 方式 2：Vercel

- 项目已包含 `vercel.json`
- 构建命令：`npm run export:web`
- 输出目录：`dist`

## Android 上架如何复用网页版

Google Play 要求提供公开可访问的隐私政策 URL。部署网页版后，可以直接使用：

- 隐私政策 URL：`https://你的域名/privacy-policy.html`
- 支持页 URL：`https://你的域名/support.html`

## 正式发布前必须替换

- `privacy-policy.html` 中的真实开发者 / 机构信息
- 支持邮箱
- 支持网站
- 数据删除联系渠道
