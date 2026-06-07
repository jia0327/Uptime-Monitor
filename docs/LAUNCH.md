# Uptime Monitor 推广发布清单

这份清单用于把项目从“能用”整理成“适合公开推广”。发布前按顺序完成即可。

## 一句话定位

基于 Cloudflare 的轻量级自部署状态监控系统，适合个人站长和小团队监控网站、域名、证书与 HTTP 服务可用性。

## 核心卖点

- 不需要自建服务器，运行在 Cloudflare Workers、Pages 和 D1。
- 支持公开状态页、管理后台、事件公告、计划维护和多渠道告警。
- 监控网站可用性、SSL 证书有效期、域名有效期和关键词校验。
- 前端资源本地打包，适合国内用户访问。
- 适合个人项目和小团队，不强行做复杂企业监控平台。

## 发布前必备

- README 首屏能说明产品定位、适用人群、截图和部署路径。
- 至少准备一套真实截图：状态页、管理后台、添加监控、通知渠道、事件维护。
- 准备一个公开 Demo 状态页，后台可以只放截图，不开放真实管理入口。
- 部署流程从零验证一次：Fork、创建 D1、初始化 schema、部署 Worker、部署 Pages、配置 `WORKER_URL`。
- 给 GitHub 仓库加上 topics：`uptime-monitor`、`status-page`、`cloudflare-workers`、`cloudflare-d1`、`vue`。
- 检查 LICENSE、README、截图路径、Actions 状态和默认分支。

## 推荐截图

| 截图 | 用途 |
|---|---|
| 公开状态页 | 让用户第一眼理解最终效果 |
| 管理控制台 | 展示监控列表、状态和操作密度 |
| 添加监控弹窗 | 展示配置能力和上手成本 |
| 通知渠道管理 | 展示告警目标配置 |
| 事件与维护 | 展示状态页公告和维护窗口能力 |

## Demo 建议

- 当前 Demo 状态页：`https://uptime.nianshu2022.cn`
- 当前 Demo 后台：`https://uptime.nianshu2022.cn/admin`
- 当前 Demo 密码：`Qwer1234`
- 使用一个单独的 Cloudflare 项目部署 Demo，不要混用生产监控实例。
- Demo 状态页可以配置 3 到 5 个公开站点。
- Demo 密码只用于演示环境，不要复用到生产环境。

## 发布渠道

- GitHub：完善 README、topics、release notes。
- 个人博客：写一篇“我为什么做这个轻量监控系统”。
- V2EX / 掘金 / 开源中国：发项目介绍和部署体验。
- X / 即刻 / 微信朋友圈：发截图和一句话定位。
- Cloudflare 相关社区：突出 Workers、Pages、D1 的低成本部署。

## 发布文案模板

我做了一个轻量级自部署监控系统 Uptime Monitor，运行在 Cloudflare Workers、Pages 和 D1 上，不需要自建服务器。

它可以监控网站可用性、SSL 证书、域名有效期和关键词校验，支持公开状态页、后台管理、事件公告、计划维护，以及企业微信、飞书、钉钉、Webhook、Telegram、Email 通知。

适合个人站长、独立开发者和小团队，用来监控自己的博客、API、产品官网或轻量服务。

项目地址：`https://github.com/nianshu2022/Uptime-Monitor`

## 推广后的第一周

- 收集部署失败的真实报错，优先补 FAQ。
- 记录用户最常问的 5 个问题，反向优化 README。
- 观察 GitHub Star、Issue、Fork 和 README 图片点击反馈。
- 如果多人卡在同一步，优先做脚本或文档简化，不急着加功能。
- 保持第一批 Issue 的响应速度，这比新增功能更影响信任。
