"use client";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import { Home, Upload } from "lucide-react";

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-200/50">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">RiSSA 資料上傳入口</h1>
                            <p className="text-sm text-slate-500">參與中心專用安全資料上傳通道</p>
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
            <main className="max-w-4xl mx-auto px-6 py-12">
                <FileUploader />
            </main>
        </div>
    );
}

