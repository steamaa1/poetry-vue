# 诗笺 Chinese Poetry Vue

一款基于 Vue 3、Vite 与[诗泉 API](https://poetry.palemoky.com/)开发的中国古典诗词网页。

## 功能说明

### 诗笺阅读

- 从诗泉收录的古典诗词中随机推荐作品，并支持按朝代、体裁筛选。
- 支持简体与繁体界面切换，诗词正文可独立切换简繁版本。
- 支持本地收藏、抄录全诗、系统分享与诗词专属链接。
- 支持查询译文与赏析，并可生成带水墨背景、朱砂印章和专属链接的诗词卡片。
- 提供查字模式，点击诗句中的汉字可前往汉典查询读音与释义。
- 提供沉浸式全屏阅读，并适配手机安全区域、长诗和繁体字体。
- 使用浏览器式阅读历史，可在已阅读诗词之间后退与前进。

### 寻诗与诗海

- 支持全文、标题、正文及作者搜索，包含关键词高亮和分页浏览。
- 提供飞花令，输入一个汉字即可随机寻找正文包含该字的诗词。
- 提供诗海漫游、数据统计、诗人名录、朝代时间轴和诗体词牌知识卡。
- 支持按诗人、朝代或体裁随机阅读作品，并可查询诗人生平。

### 诗趣雅集

- 提供独立的诗趣雅集页面与移动端雅戏抽屉。
- 每日一诗在同一天固定推荐同一首作品，并记录连续阅读天数。
- 月历会标记已阅读日期，并允许返回查看曾经留下的每日诗笺。
- 补阙成章根据给出的上一句补全下一句，支持答案校验、差异提示、揭晓答案和本地答题统计。

### 界面与稳定性

- 桌面端提供下拉目录，移动端提供固定底部导航与抽屉菜单。
- 首页与雅集共用站点目录、页脚、诗词卡片生成器和繁体语言文件。
- 所有 API 请求均包含 10 秒超时和最多 2 次自动重试。
- 提供独立 API 状态页面，可检测关键接口状态和响应延迟。
- 已适配 Cloudflare Pages、Cloudflare Workers、Vercel 和 Netlify 的同源 API 代理。
- 支持响应式布局，并针对部分移动浏览器的底部安全区域与固定导航进行兼容处理。

## 开发路线图

以下仅保留尚未开发的功能，编号沿用原功能规划清单。

### 收藏、历史与阅读体验

- [ ] **9. 收藏管理**：支持收藏搜索、排序、单项删除、清空，以及 TXT/JSON 导入导出。
- [ ] **12. 字体和排版设置**：调整字号、行距、字间距、对齐方式，并提供竖排阅读。

### 诗词互动

- [ ] **23. 联句续章**：根据上一句或末字继续寻找、回答诗句，实现真正的诗词接龙。
- [ ] **24. 诗谜寻踪**：隐藏诗人或诗名，根据正文猜其来处。

### 离线能力

- [ ] **30. 离线缓存**：通过 Service Worker 缓存网站资源、最近阅读及收藏诗词。

## 语言文件

- 简体中文是默认语言，文案直接维护在 `src/App.vue` 的 `zhHans` 对象中。
- 繁体中文独立维护在 `src/locales/zh-Hant.js`。
- 繁体语言包会与默认简体文案合并；新增字段若暂未翻译，会自动回退到简体，避免界面出现空白。
- 诗词正文的简繁内容仍由诗泉 API 的 `lang=zh-Hans / zh-Hant` 参数提供，不由前端语言文件转换。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物位于 `dist/`。

## 部署说明

部署前先将本仓库 Fork 到自己的 GitHub 账号，或直接导入：

```text
https://github.com/steamaa1/chinese-poetry-vue
```

部署完成后请依次访问以下地址确认功能正常：

```text
https://你的域名/
https://你的域名/yaji.html
https://你的域名/api/stats
```

`/api/stats` 能返回 JSON 数据即表示 API 代理正常。

### Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 左侧进入 **Workers & Pages**；
3. 点击 **Create application**；
4. 选择 **Pages**；
5. 点击 **Connect to Git**；
6. 连接 GitHub，选择 `chinese-poetry-vue` 仓库；
7. 在构建设置中填写：

```text
Production branch：main
Framework preset：Vue
Build command：npm run build
Build output directory：dist
Root directory：/
```

8. 环境变量保持为空；
9. 点击 **Save and Deploy**；
10. 等待构建完成，打开 Cloudflare 分配的 `pages.dev` 域名；
11. 访问 `/api/stats`，确认返回诗词统计 JSON；
12. 访问 `/yaji.html`，确认诗趣雅集可以打开。

绑定自定义域名：

1. 进入该 Pages 项目；
2. 点击 **Custom domains**；
3. 点击 **Set up a custom domain**；
4. 输入自己的域名；
5. 按页面提示确认 DNS 记录；
6. 等待证书状态变为 **Active**。

以后向 GitHub 的 `main` 分支推送代码，Cloudflare Pages 会自动重新部署。

### Cloudflare Workers

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 左侧进入 **Workers & Pages**；
3. 点击 **Create application**；
4. 选择 **Import a repository**；
5. 连接 GitHub，选择 `chinese-poetry-vue`；
6. 项目名称可以保持 `chinese-poetry-vue`；
7. Build command 填写：

```text
npm run build
```

8. Deploy command 填写：

```text
npx wrangler deploy
```

9. Root directory 保持仓库根目录；
10. 环境变量保持为空；
11. 点击 **Deploy**；
12. 部署完成后打开分配的 `workers.dev` 域名；
13. 访问 `/api/stats`，确认返回 JSON；
14. 访问 `/yaji.html`，确认诗趣雅集可以打开。

命令行部署方法：

```bash
npm install
npm run build
npx wrangler login
npx wrangler deploy
```

绑定自定义域名：

1. 进入 Worker 项目；
2. 打开 **Settings**；
3. 进入 **Domains & Routes**；
4. 点击 **Add**；
5. 选择 **Custom Domain**；
6. 输入域名并确认。

### Vercel

1. 登录 [Vercel](https://vercel.com/)；
2. 点击 **Add New**；
3. 选择 **Project**；
4. 在 GitHub 仓库列表中找到 `chinese-poetry-vue`；
5. 点击 **Import**；
6. 在项目配置页确认：

```text
Framework Preset：Vite
Root Directory：./
Build Command：npm run build
Output Directory：dist
Install Command：npm install
Node.js Version：20.x 或更高
```

7. Environment Variables 保持为空；
8. 点击 **Deploy**；
9. 部署完成后打开 Vercel 分配的域名；
10. 访问 `/api/stats`，确认返回 JSON；
11. 访问 `/yaji.html`，确认诗趣雅集可以打开。

绑定自定义域名：

1. 进入 Vercel 项目；
2. 点击 **Settings**；
3. 点击 **Domains**；
4. 输入自己的域名；
5. 点击 **Add**；
6. 按页面提示添加或修改 DNS 记录；
7. 等待域名状态显示配置成功。

以后向 GitHub 的 `main` 分支推送代码，Vercel 会自动重新部署。

### Netlify

1. 登录 [Netlify](https://app.netlify.com/)；
2. 点击 **Add new site**；
3. 选择 **Import an existing project**；
4. 选择 **Deploy with GitHub**；
5. 授权后选择 `chinese-poetry-vue` 仓库；
6. 在构建配置中确认：

```text
Base directory：留空
Build command：npm run build
Publish directory：dist
Functions directory：netlify/functions
```

7. 环境变量保持为空；
8. 点击 **Deploy chinese-poetry-vue**；
9. 等待部署完成，打开 Netlify 分配的域名；
10. 访问 `/api/stats`，确认返回 JSON；
11. 访问 `/yaji.html`，确认诗趣雅集可以打开。

绑定自定义域名：

1. 进入 Netlify 站点；
2. 点击 **Domain management**；
3. 点击 **Add a domain**；
4. 选择 **Add a domain you already own**；
5. 输入域名并确认；
6. 按页面提示配置 DNS；
7. 等待 HTTPS 证书签发完成。

以后向 GitHub 的 `main` 分支推送代码，Netlify 会自动重新部署。

## 数据来源

- API：[诗泉](https://poetry.palemoky.com/)
- 项目：[palemoky/chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api)

## 许可证

本项目源代码与原创资源采用 [MIT License](LICENSE) 开源，版权所有 © 2026 Jiacheng。

诗词数据由「诗泉」API 提供，第三方数据、字体、图标及其他外部资源遵循各自的许可证或使用条款，不属于本项目 MIT License 的授权范围。

---

本项目由**GPT5.6-Sol**辅助开发
