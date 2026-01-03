import Link from "next/link";
import DataDownloader from "@/components/DataDownloader";
import { ArrowRight, Database, ShieldCheck, FileText, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptLTYtNnY2aC02di02aDZ6bTYgMHY2aC02di02aDZ6bTYgMHY2aC02di02aDZ6bS02LTZ2Nmg2djZoNnY2aC02djZoLTZ2Nmhbay02di02aC02di02aDYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/20 rounded-full px-4 py-1.5 text-sm text-sky-300 mb-6">
            <Sparkles className="w-4 h-4" />
            多中心臨床資料管理系統
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
              RiSSA 研究平台
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            機器人體內單吻合器吻合術 (RiSSA)<br />
            安全、可靠的多中心資料搜集與驗證系統
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6 -mt-8 pb-16">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link href="/upload" className="group">
              <div className="h-full p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 cursor-pointer">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-200/50 group-hover:scale-110 transition-transform duration-300 mb-6">
                  <Database size={26} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">各中心資料上傳</h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  參與中心由此上傳資料。系統將自動進行敏感資料偵測與欄位格式驗證。
                </p>
                <div className="inline-flex items-center text-sky-600 font-semibold">
                  前往上傳 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            <Link href="/pi" className="group">
              <div className="h-full p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-300 mb-6">
                  <ShieldCheck size={26} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">主持人 (PI) 控制台</h2>
                <p className="text-slate-500 leading-relaxed mb-6">
                  計畫主持人專用。設定專案、定義 Schema 與檢視全域驗證狀態。
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold">
                  管理專案 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Resources Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">資源下載</h3>
                <p className="text-slate-500">取得資料範本或下載已驗證的合併資料</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/multicenter_schema.xlsx"
                  download
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  下載資料範本
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">合併資料下載 (需密碼)</h4>
              <DataDownloader />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          © 2026 RiSSA 多中心研究團隊
        </div>
      </footer>
    </div>
  );
}

