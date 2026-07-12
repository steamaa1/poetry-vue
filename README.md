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

项目使用 Vite 多页面构建，构建命令统一为：

```bash
npm install
npm run build
```

构建产物位于 `dist/`，包含首页 `index.html` 与诗趣雅集 `yaji.html`。建议使用 Node.js 20 或更高版本，无需配置环境变量。

### Cloudflare Pages

当前仓库对 Cloudflare Pages 的支持最完整，`functions/api/[[path]].js` 会被自动识别为 Pages Function，并为前端提供同源 `/api/*` 代理。

- Framework preset：`Vue`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：`/`

连接 GitHub 仓库并保存配置后即可部署，页面与 API 代理均可直接使用。

### Cloudflare Workers

可以使用 Workers Static Assets 托管 `dist/`，但当前的 `functions/api/[[path]].js` 属于 Pages Functions 格式，不能直接作为 Workers 入口使用。

完整部署需要：

1. 构建前端：`npm run build`；
2. 将 `dist/` 配置为 Worker 静态资源目录；
3. 把现有 Pages Function 代理逻辑迁移到 Worker 的 `fetch` 处理器；
4. 在 Worker 中接管 `/api/*`，其他请求返回静态资源。

如果仅发布 `dist/` 而不迁移代理，页面可以打开，但依赖 `/api/*` 的诗词功能不可用。

### Vercel

导入 GitHub 仓库后使用以下配置：

- Framework preset：`Vite`
- Build command：`npm run build`
- Output directory：`dist`
- Install command：`npm install`

当前 Cloudflare Pages Function 不会被 Vercel 执行。要保留完整诗词功能，需要新增 Vercel Function，在 `/api/*` 路径下实现与 `functions/api/[[path]].js` 相同的上游代理与超时重试逻辑。

仅部署前端时，静态页面可以访问，但 API 功能不可用。

### Netlify

导入 GitHub 仓库后使用以下配置：

- Build command：`npm run build`
- Publish directory：`dist`
- Base directory：留空或使用仓库根目录

当前 Cloudflare Pages Function 不会被 Netlify 执行。完整部署需要新增 Netlify Function，并通过重写规则将 `/api/*` 转发到该 Function。

仅发布 `dist/` 时，静态页面可以访问，但依赖 API 的功能不可用。

## 数据来源

- API：[诗泉](https://poetry.palemoky.com/)
- 项目：[palemoky/chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api)

## API 代理

当前仓库内置的是 Cloudflare Pages Functions 实现：`functions/api/[[path]].js`。它将同源 `/api/*` 请求代理到诗泉 API，避免浏览器受到第三方接口 CORS 限制。

使用 Cloudflare Workers、Vercel 或 Netlify 时，需要按上方部署说明将这段代理逻辑迁移到对应平台的服务端函数格式。

### 超时与重试

- 浏览器端 API 请求超时为 10 秒。
- 服务端代理请求诗泉的超时为 10 秒。
- 网络错误、HTTP 408、429 与 5xx 错误最多自动重试 2 次，并采用递增等待时间。
- 参数错误、权限错误、404 等确定性错误不会重试。

---

本项目由**GPT5.6-Sol**辅助开发
