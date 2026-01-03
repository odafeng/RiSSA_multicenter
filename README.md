# RiSSA 多中心臨床資料管理系統

機器人體內單吻合器吻合術 (RiSSA) 多中心資料搜集與驗證平台。

## 技術架構

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Validation**: Pandas-based schema validation

## 快速開始

### 後端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

瀏覽 http://localhost:3000

## 功能特色

- 📊 **多中心資料上傳** - 參與中心可安全上傳 CSV 資料
- 🔒 **敏感資料偵測** - 自動檢測並阻擋包含個資的欄位
- ✅ **Schema 驗證** - 支援必填欄位、資料類型、值域、允許值、正則格式驗證
- 📁 **專案管理** - PI 可建立、編輯、刪除專案
- 🔑 **密碼保護下載** - 合併資料需密碼才能下載

## 開發者

高雄榮民總醫院 黃士峯醫師
