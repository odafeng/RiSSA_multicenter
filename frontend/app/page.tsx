import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Database, ShieldCheck, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-tr from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent animate-in fade-in zoom-in duration-1000">
          RiSSA 研究平台
        </h1>
        <p className="text-xl text-muted-foreground">
          機器人體內單吻合器吻合術 (RiSSA)<br />
          多中心資料搜集與驗證系統
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/upload" className="group">
          <div className="h-full p-8 border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left space-y-4 cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Database size={24} />
            </div>
            <h2 className="text-2xl font-bold">各中心資料上傳</h2>
            <p className="text-muted-foreground">參與中心由此上傳資料。系統將自動進行敏感資料偵測與欄位格式驗證。</p>
            <div className="flex items-center text-primary font-medium mt-4">
              前往上傳 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/pi" className="group">
          <div className="h-full p-8 border rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left space-y-4 cursor-pointer">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl font-bold">主持人 (PI) 控制台</h2>
            <p className="text-muted-foreground">計畫主持人專用。設定專案、定義資料欄位架構 (Schema) 與檢視全域驗證狀態。</p>
            <div className="flex items-center text-primary font-medium mt-4">
              管理專案 <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-4xl text-center">
        <a
          href="/multicenter_schema.xlsx"
          download
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <FileText className="mr-2 w-4 h-4" /> 下載資料範本 (Excel)
        </a>
      </div>
    </div>
  );
}
