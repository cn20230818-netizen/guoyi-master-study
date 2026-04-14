# 中国域名接入路线图

最后更新：2026-04-15

适用对象：当前网站托管在 GitHub Pages，准备后续绑定中国域名。

## 当前建议

- 已注册：`guoyinaobing.cn`
- 建议正式访问域名使用：`www.guoyinaobing.cn`
- 根域名：`guoyinaobing.cn`

原因：

- `www` 子域名接 GitHub Pages 最稳，官方推荐用 `CNAME` 指向 `<user>.github.io`
- 根域名可保留为跳转入口
- 未来如果迁移到中国大陆服务器，根域名和 `www` 都更容易平滑切换

## 你现在的站点

- 正式站点：`https://cn20230818-netizen.github.io/guoyi-master-study/`
- 仓库：`https://github.com/cn20230818-netizen/guoyi-master-study`

## 第一步：注册 .cn 域名

可选注册商：

- 阿里云
- 腾讯云

注册时通常要完成：

- 域名可用性确认
- 账户实名认证
- `.cn` 域名实名资料提交
- 支付

## 当前状态

- GitHub Pages 自定义域名已写入：`www.guoyinaobing.cn`
- 当前 DNS 还未检测到解析记录
- 下一步重点是去域名控制台补解析

## 第二步：DNS 解析配置

如果你使用 `www.guoyinaobing.cn` 作为正式域名，推荐这样配：

### 方案 A：最稳妥推荐

- `www` 记录：`CNAME` -> `cn20230818-netizen.github.io`
- 根域名 `@`：
  - 如果注册商支持 `ALIAS` / `ANAME`，优先指向 `cn20230818-netizen.github.io`
  - 如果不支持，可改用 4 条 `A` 记录指向 GitHub Pages 官方 IP

GitHub Pages 常用 `A` 记录：

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

可选 IPv6 `AAAA` 记录：

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

### 不推荐

- 不建议把 `www` 直接 CNAME 到 `cn20230818-netizen.github.io/guoyi-master-study`
- 不建议使用泛解析 `*.guoyinaobing.cn`

## 第三步：GitHub Pages 里设置自定义域名

仓库路径：

- `Settings`
- `Pages`
- `Custom domain`

填写：

- `www.guoyinaobing.cn`

完成后：

- 勾选 `Enforce HTTPS`
- 建议继续做一次域名验证，防止域名被其他 Pages 仓库占用

说明：

- 你当前仓库使用的是 GitHub Actions 发布 Pages
- 这种模式下不强依赖仓库根目录里的 `CNAME` 文件
- 自定义域名应以 GitHub Pages 设置页里的配置为准

## 第四步：ICP备案怎么判断

### 当前 GitHub Pages 阶段

如果网站仍然托管在 GitHub Pages，而不是中国大陆云服务器：

- 一般不走阿里云/腾讯云的中国大陆接入备案流程
- 可先完成域名注册、实名认证、DNS 解析、自定义域名绑定

### 未来迁移到中国大陆服务器时

如果你后续把网站迁到阿里云/腾讯云中国大陆服务器：

- 必须通过实际接入服务商办理 ICP 备案
- 通常还需要准备：
  - 主体证件
  - 域名实名信息
  - 中国大陆云资源
  - 负责人核验材料

### 非中国大陆服务器

如果未来迁到：

- 中国香港服务器
- 海外服务器

通常不走中国大陆 ICP 备案流程。

## 最短执行顺序

1. 在阿里云或腾讯云注册 `guoyinaobing.cn`
2. 完成 `.cn` 域名实名认证
3. 在 DNS 控制台新增 `www` 的 `CNAME`
4. 在 GitHub 仓库 Pages 设置里填入 `www.guoyinaobing.cn`
5. 等待证书签发并开启 HTTPS
6. 再决定是否给根域名做跳转或解析

## 我建议你这样落地

短期：

- 保持 GitHub Pages 托管
- 先绑定 `www.guoyinaobing.cn`
- 先不迁服务器

中期：

- 如果要更稳定、更像正式商业站点，可以迁到 Vercel、Netlify 或中国香港服务器

长期：

- 如果准备面向中国大陆做更正式运营，再迁到中国大陆云资源并补 ICP 备案

## 完成注册后，我下一步可以继续做什么

只要你把以下任一信息发给我：

- 域名已买好
- DNS 控制台截图
- 你最终选的是阿里云还是腾讯云

我就可以继续帮你：

- 检查 DNS 应该怎么填
- 帮你核对 GitHub Pages 自定义域名设置
- 给你输出一版最终上线检查单
