"use client";
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { UploadCloud, Check, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FileUploader() {
    const [projectId, setProjectId] = useState("");
    const [centerName, setCenterName] = useState("高雄榮總"); // Default to first option
    const [uploaderName, setUploaderName] = useState(""); // New state
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean, msg: string, report?: any } | null>(null);

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
                            <label className="text-xs uppercase text-muted-foreground font-bold">專案 ID</label>
                            <Input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="1" />
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
                            <div>
                                <h4 className="font-bold">{result.success ? "成功" : "驗證失敗"}</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{result.msg}</p>
                                {result.report && (
                                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-40">
                                        {JSON.stringify(result.report, null, 2)}
                                    </pre>
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
