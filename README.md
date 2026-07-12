# 诗笺 Chinese Poetry Vue

一款基于 Vue 3、Vite 与[诗泉 API](https://poetry.palemoky.com/)开发的中国古典诗词网页。

## 功能

- 随机诗词推荐
- 按朝代和体裁筛选
- 全文、标题、正文及作者搜索
- 简繁体切换
- 本地收藏与一键复制
- 响应式移动端设计

## 开发路线图

以下功能已列入待办计划，编号沿用功能规划清单。

### 诗词发现与内容浏览

- [x] **1. 飞花令**：输入一个汉字，随机获取正文中包含该字的诗词，提供常用字快捷入口与换一首功能。
- [x] **2. 数据统计**：展示收录诗词、作者、朝代和体裁数量。
- [x] **3. 诗海浏览**：分页浏览全部诗词，支持展开、收藏、分享和查询译文。
- [x] **5. 诗人列表**：分页展示诗人，并支持按朝代浏览和按作者随机选诗。
- [x] **6. 朝代时间轴**：根据朝代起止年份展示时间线，并提供按朝代阅读入口。
- [x] **7. 体裁知识卡**：展示绝句、律诗、宋词、元曲等体裁的格式与简介。
- [x] **8. 每日一诗**：每天固定推荐一首诗，并记录连续阅读天数。

### 收藏、历史与阅读体验

- [ ] **9. 收藏管理**：支持收藏搜索、排序、单项删除、清空，以及 TXT/JSON 导入导出。
- [ ] **12. 字体和排版设置**：调整字号、行距、字间距、对齐方式，并提供竖排阅读。
- [x] **13. 全屏阅读**：进入仅保留诗词正文和必要操作的沉浸式阅读界面。
- [x] **14. 生成诗词卡片**：将诗词、水墨背景、站点信息和分享链接生成可下载图片。

### 搜索与内容辅助

- [x] **15. 搜索结果分页**：支持加载更多、上一页、下一页和页码状态。
- [x] **17. 高亮搜索词**：在标题、作者和诗句中突出显示命中的关键词。
- [x] **21. 生僻字查询**：点击或选中诗中字词后，跳转汉典或搜索引擎查询读音与释义。

### 诗词互动

- [ ] **23. 联句续章**：根据上一句或末字继续寻找、回答诗句。
- [ ] **24. 诗谜寻踪**：隐藏诗人或诗名，根据正文猜其来处。
- [x] **26. 补阙成章**：随机隐藏诗句中的部分文字并检查答案。

### 稳定性、离线与分享

- [x] **28. API 状态显示**：检测诗泉服务状态，并在异常时显示友好提示。
- [x] **29. 请求重试与超时**：增加请求超时、自动重试、防重复点击和清晰的错误反馈。
- [ ] **30. 离线缓存**：通过 Service Worker 缓存网站资源、最近阅读及收藏诗词。
- [x] **31. 分享指定诗词链接**：使用带诗词 ID 的 URL，让接收者直接打开同一首诗。

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

---

本项目由**GPT5.6-Sol**辅助开发
