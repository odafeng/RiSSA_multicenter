"use client";
import Link from "next/link";
import SubmissionList from "@/components/SubmissionList";
import ProjectManager from "@/components/ProjectManager";
import { Home, Settings } from "lucide-react";

export default function PIDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-purple-200/50">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">主持人 (PI) 控制台</h1>
                            <p className="text-sm text-slate-500">專案與 Schema 管理</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        <Home className="w-4 h-4" /> 回首頁
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                <ProjectManager />
                <SubmissionList />
            </main>
        </div>
    );
}
