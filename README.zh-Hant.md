<div align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="詩箋 Logo">
  <h1>詩箋</h1>
  <p><sub>Chinese Poetry Vue</sub></p>
  <p>
    <a href="README.md">简体中文（默认）</a> |
    <a href="README.zh-Hant.md">繁體中文</a> |
    <a href="README.en.md">English</a>
  </p>
  <p>一款基於 Vue 3、Vite 與<a href="https://poetry.palemoky.com/">詩泉 API</a> 開發的中國古典詩詞網頁。</p>
</div>

## 功能說明

### 詩箋閱讀

- 從詩泉收錄的古典詩詞中隨機推薦作品，並支援按朝代、體裁篩選。
- 支援簡體與繁體介面切換，詩詞正文可獨立切換簡繁版本。
- 支援本地收藏、抄錄全詩、系統分享與詩詞專屬連結。
- 支援查詢譯文與賞析，並可生成帶水墨背景、朱砂印章和專屬連結的詩詞卡片。
- 提供查字模式，點擊詩句中的漢字可前往漢典查詢讀音與釋義。
- 提供沉浸式全屏閱讀，並適配手機安全區域、長詩和繁體字型。
- 使用瀏覽器式閱讀歷史，可在已閱讀詩詞之間後退與前進。

### 尋詩與詩海

- 支援全文、標題、正文及作者搜尋，包含關鍵詞高亮和分頁瀏覽。
- 提供飛花令，輸入一個漢字即可隨機尋找正文包含該字的詩詞。
- 提供詩海漫遊、資料統計、詩人名錄、朝代時間軸和詩體詞牌知識卡。
- 支援按詩人、朝代或體裁隨機閱讀作品，並可查詢詩人生平。

### 詩趣雅集

- 提供獨立的詩趣雅集頁面與移動端雅戲抽屜。
- 每日一詩在同一天固定推薦同一首作品，並記錄連續閱讀天數。
- 月曆會標記已閱讀日期，並允許返回查看曾經留下的每日詩箋。
- 補闕成章根據給出的上一句補全下一句，支援答案校驗、差異提示、揭曉答案和本地答題統計。

### 介面與穩定性

- 桌面端提供下拉目錄，移動端提供固定底部導航與抽屜選單。
- 首頁與雅集共用站點目錄、頁尾、詩詞卡片生成器和繁體語言檔案。
- 所有 API 請求均包含 10 秒逾時和最多 2 次自動重試。
- 提供獨立 API 狀態頁面，可檢測關鍵介面狀態和回應延遲。
- 已適配 Cloudflare Pages、Cloudflare Workers、Vercel 和 Netlify 的同源 API 代理。
- 支援響應式佈局，並針對部分移動瀏覽器的底部安全區域與固定導航進行相容處理。

## 開發路線圖

以下僅保留尚未開發的功能，編號沿用原功能規劃清單。

### 收藏、歷史與閱讀體驗

- [ ] **9. 收藏管理**：支援收藏搜尋、排序、單項刪除、清空，以及 TXT/JSON 匯入匯出。
- [ ] **12. 字型和排版設定**：調整字號、行距、字間距、對齊方式，並提供直排閱讀。

### 詩詞互動

- [ ] **23. 聯句續章**：根據上一句或末字繼續尋找、回答詩句，實現真正的詩詞接龍。
- [ ] **24. 詩謎尋蹤**：隱藏詩人或詩名，根據正文猜其來處。

### 離線能力

- [ ] **30. 離線快取**：透過 Service Worker 快取網站資源、最近閱讀及收藏詩詞。

## 語言檔案

- 簡體中文是預設語言，文案直接維護在 `src/App.vue` 的 `zhHans` 物件中。
- 繁體中文獨立維護在 `src/locales/zh-Hant.js`。
- 繁體語言包會與預設簡體文案合併；新增欄位若暫未翻譯，會自動回退到簡體，避免介面出現空白。
- 詩詞正文的簡繁內容仍由詩泉 API 的 `lang=zh-Hans / zh-Hant` 參數提供，不由前端語言檔案轉換。

## 本地開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

建置產物位於 `dist/`。

## 部署說明

部署前先將本倉庫 Fork 到自己的 GitHub 帳號，或直接匯入：

```text
https://github.com/steamaa1/chinese-poetry-vue
```

部署完成後請依次訪問以下網址確認功能正常：

```text
https://你的網域/
https://你的網域/yaji.html
https://你的網域/api/stats
```

`/api/stats` 能返回 JSON 資料即表示 API 代理正常。

### Cloudflare Pages

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 左側進入 **Workers & Pages**；
3. 點擊 **Create application**；
4. 選擇 **Pages**；
5. 點擊 **Connect to Git**；
6. 連接 GitHub，選擇 `chinese-poetry-vue` 倉庫；
7. 在建置設定中填寫：

```text
Production branch：main
Framework preset：Vue
Build command：npm run build
Build output directory：dist
Root directory：/
```

8. 環境變數保持空白；
9. 點擊 **Save and Deploy**；
10. 等待建置完成，開啟 Cloudflare 分配的 `pages.dev` 網域；
11. 訪問 `/api/stats`，確認返回詩詞統計 JSON；
12. 訪問 `/yaji.html`，確認詩趣雅集可以開啟。

綁定自訂網域：

1. 進入該 Pages 專案；
2. 點擊 **Custom domains**；
3. 點擊 **Set up a custom domain**；
4. 輸入自己的網域；
5. 按頁面提示確認 DNS 記錄；
6. 等待憑證狀態變為 **Active**。

以後向 GitHub 的 `main` 分支推送程式碼，Cloudflare Pages 會自動重新部署。

### Cloudflare Workers

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)；
2. 左側進入 **Workers & Pages**；
3. 點擊 **Create application**；
4. 選擇 **Import a repository**；
5. 連接 GitHub，選擇 `chinese-poetry-vue`；
6. 專案名稱可以保持 `chinese-poetry-vue`；
7. Build command 填寫：

```text
npm run build
```

8. Deploy command 填寫：

```text
npx wrangler deploy
```

9. Root directory 保持倉庫根目錄；
10. 環境變數保持空白；
11. 點擊 **Deploy**；
12. 部署完成後開啟分配的 `workers.dev` 網域；
13. 訪問 `/api/stats`，確認返回 JSON；
14. 訪問 `/yaji.html`，確認詩趣雅集可以開啟。

命令列部署方法：

```bash
npm install
npm run build
npx wrangler login
npx wrangler deploy
```

綁定自訂網域：

1. 進入 Worker 專案；
2. 開啟 **Settings**；
3. 進入 **Domains & Routes**；
4. 點擊 **Add**；
5. 選擇 **Custom Domain**；
6. 輸入網域並確認。

### Vercel

1. 登入 [Vercel](https://vercel.com/)；
2. 點擊 **Add New**；
3. 選擇 **Project**；
4. 在 GitHub 倉庫列表中找到 `chinese-poetry-vue`；
5. 點擊 **Import**；
6. 在專案設定頁確認：

```text
Framework Preset：Vite
Root Directory：./
Build Command：npm run build
Output Directory：dist
Install Command：npm install
Node.js Version：20.x 或更高
```

7. Environment Variables 保持空白；
8. 點擊 **Deploy**；
9. 部署完成後開啟 Vercel 分配的網域；
10. 訪問 `/api/stats`，確認返回 JSON；
11. 訪問 `/yaji.html`，確認詩趣雅集可以開啟。

綁定自訂網域：

1. 進入 Vercel 專案；
2. 點擊 **Settings**；
3. 點擊 **Domains**；
4. 輸入自己的網域；
5. 點擊 **Add**；
6. 按頁面提示新增或修改 DNS 記錄；
7. 等待網域狀態顯示設定成功。

以後向 GitHub 的 `main` 分支推送程式碼，Vercel 會自動重新部署。

### Netlify

1. 登入 [Netlify](https://app.netlify.com/)；
2. 點擊 **Add new site**；
3. 選擇 **Import an existing project**；
4. 選擇 **Deploy with GitHub**；
5. 授權後選擇 `chinese-poetry-vue` 倉庫；
6. 在建置設定中確認：

```text
Base directory：留空
Build command：npm run build
Publish directory：dist
Functions directory：netlify/functions
```

7. 環境變數保持空白；
8. 點擊 **Deploy chinese-poetry-vue**；
9. 等待部署完成，開啟 Netlify 分配的網域；
10. 訪問 `/api/stats`，確認返回 JSON；
11. 訪問 `/yaji.html`，確認詩趣雅集可以開啟。

綁定自訂網域：

1. 進入 Netlify 站點；
2. 點擊 **Domain management**；
3. 點擊 **Add a domain**；
4. 選擇 **Add a domain you already own**；
5. 輸入網域並確認；
6. 按頁面提示設定 DNS；
7. 等待 HTTPS 憑證簽發完成。

以後向 GitHub 的 `main` 分支推送程式碼，Netlify 會自動重新部署。

## 資料來源

- API：[詩泉](https://poetry.palemoky.com/)
- 專案：[palemoky/chinese-poetry-api](https://github.com/palemoky/chinese-poetry-api)

## 授權條款

本專案原始碼與原創資源採用 [MIT License](LICENSE) 開源，版權所有 © 2026 Jiacheng。

詩詞資料由「詩泉」API 提供，第三方資料、字型、圖示及其他外部資源遵循各自的授權條款或使用條款，不屬於本專案 MIT License 的授權範圍。

---

本專案由 **GPT5.6-Sol** 輔助開發
