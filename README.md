# 诗笺 Poetry Vue

一款基于 Vue 3、Vite 与[诗泉 API](https://poetry.palemoky.com/)开发的中国古典诗词网页。

## 功能

- 随机诗词推荐
- 按朝代和体裁筛选
- 全文、标题、正文及作者搜索
- 简繁体切换
- 本地收藏与一键复制
- 响应式移动端设计

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

## Cloudflare Pages

- Framework preset：`Vue`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：`/`
- Node.js version：建议 `20` 或更高

无需配置环境变量。

## 数据来源

- API：[诗泉](https://poetry.palemoky.com/)
- 项目：[palemoky/chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api)
