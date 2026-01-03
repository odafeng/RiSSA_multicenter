"use client";
import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { UploadCloud, Check, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
    id: number;
    name: string;
}

export default function FileUploader() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectId, setProjectId] = useState("");
    const [centerName, setCenterName] = useState("高雄榮總"); // Default to first option
    const [uploaderName, setUploaderName] = useState(""); // New state
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean, msg: string, report?: any } | null>(null);

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/api/projects');
                setProjects(res.data);
                if (res.data.length > 0) {
                    setProjectId(res.data[0].id.toString());
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            }
        };
        fetchProjects();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        const missingFields = [];
        if (!file) missingFields.push("檔案 (CSV)");
        if (!projectId) missingFields.push("專案 ID");
        if (!centerName) missingFields.push("中心名稱");
        if (!uploaderName) missingFields.push("上傳者姓名");

        if (missingFields.length > 0) {
            alert(`請填寫以下欄位: ${missingFields.join(", ")}`);
            return;
        }

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file!);
        formData.append('center_name', centerName);
        formData.append('uploader_name', uploaderName);

        try {
            const res = await axios.post(`/api/projects/${projectId}/submissions`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult({ success: true, msg: "上傳成功!", report: res.data });
        } catch (err: any) {
            console.error("Upload error:", err);

            let msg = "上傳失敗";

            // Check if we have a response from server
            if (err.response) {
                const status = err.response.status;
                const detail = err.response.data?.detail;

                // Build detailed error message
                if (typeof detail === 'string') {
                    msg = detail;
                } else if (Array.isArray(detail)) {
                    // FastAPI 422 validation errors
                    msg = detail.map((e: any) => {
                        const field = e.loc?.slice(-1)[0] || 'Unknown field';
                        return `${field}: ${e.msg}`;
                    }).join('\n');
                } else if (detail && typeof detail === 'object') {
                    msg = JSON.stringify(detail, null, 2);
                } else {
                    msg = `HTTP ${status}: ${err.response.statusText || '伺服器錯誤'}`;
                }
            } else if (err.request) {
                // Request was made but no response received
                msg = "無法連線到伺服器，請確認後端是否運行中 (uvicorn)";
            } else {
                // Error in setting up request
                msg = `請求錯誤: ${err.message}`;
            }

            setResult({ success: false, msg });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>資料上傳</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-muted-foreground font-bold">選擇專案</label>
                            <select
                                className="flex h-10 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none"
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                            >
                                {projects.length === 0 ? (
                                    <option value="">尚無專案</option>
                                ) : (
                                    projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-muted-foreground font-bold">中心名稱</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={centerName}
                                onChange={e => setCenterName(e.target.value)}
                            >
                                <option value="高雄榮總">高雄榮總</option>
                                <option value="台中榮總">台中榮總</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs uppercase text-muted-foreground font-bold">上傳者姓名</label>
                            <Input value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="請輸入姓名" />
                        </div>
                    </div>

                    <div className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors",
                        file ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                    )}>
                        <Input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <div className="p-4 bg-muted rounded-full">
                                {file ? <FileText className="text-primary" size={32} /> : <UploadCloud className="text-muted-foreground" size={32} />}
                            </div>
                            <span className="text-sm font-medium">{file ? file.name : "點擊選擇 CSV 檔案"}</span>
                        </label>
                    </div>

                    <Button onClick={handleUpload} disabled={uploading || !file} className="w-full" size="lg">
                        {uploading ? <Loader2 className="animate-spin mr-2" /> : "上傳並驗證"}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card className={cn("border-l-4", result.success ? "border-l-green-500" : "border-l-red-500")}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            {result.success ? <Check className="text-green-500 mt-1" /> : <X className="text-red-500 mt-1" />}
                            <div className="flex-1">
                                <h4 className="font-bold text-lg">{result.success ? "✅ 上傳成功" : "驗證失敗"}</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{result.msg}</p>

                                {/* File Stats Display */}
                                {result.success && result.report?.file_stats && (
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 text-center border border-sky-100">
                                            <div className="text-2xl font-bold text-sky-600">{result.report.file_stats.file_size_kb}</div>
                                            <div className="text-xs text-sky-700 font-medium">KB</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-100">
                                            <div className="text-2xl font-bold text-emerald-600">{result.report.file_stats.row_count.toLocaleString()}</div>
                                            <div className="text-xs text-emerald-700 font-medium">筆資料</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center border border-violet-100">
                                            <div className="text-2xl font-bold text-violet-600">{result.report.file_stats.column_count}</div>
                                            <div className="text-xs text-violet-700 font-medium">個欄位</div>
                                        </div>
                                    </div>
                                )}

                                {/* EDA Report Link */}
                                {result.success && result.report?.eda_report_url && (
                                    <a
                                        href={result.report.eda_report_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        📊 開啟 EDA 分析報告
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <p className="text-xs text-center text-red-500 font-medium">
                注意：每個中心僅限上傳一份檔案。重複上傳將會覆蓋前一份檔案。
            </p>
        </div>
    );
}
