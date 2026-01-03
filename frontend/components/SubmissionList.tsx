"use client";
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { Loader2, RefreshCw } from 'lucide-react';

interface Submission {
    id: number;
    center_name: string;
    uploader_name?: string;
    filename: string;
    upload_date: string;
    status: string;
}

export default function SubmissionList() {
    const [projectId, setProjectId] = useState("1");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/projects/${projectId}/submissions`);
            setSubmissions(res.data);
        } catch (error) {
            console.error(error);
            alert("讀取失敗，請確認專案 ID");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>已上傳檔案列表</CardTitle>
                <div className="flex items-center gap-2">
                    <Input
                        value={projectId}
                        onChange={e => setProjectId(e.target.value)}
                        placeholder="專案 ID"
                        className="w-24 h-8"
                    />
                    <Button size="sm" variant="outline" onClick={fetchSubmissions} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-3 font-medium">中心</th>
                                <th className="p-3 font-medium">上傳者</th>
                                <th className="p-3 font-medium">檔案名稱</th>
                                <th className="p-3 font-medium">版本 ID</th>
                                <th className="p-3 font-medium">時間</th>
                                <th className="p-3 font-medium">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        尚無資料
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id} className="border-t hover:bg-muted/50 transition-colors">
                                        <td className="p-3 font-medium">{sub.center_name}</td>
                                        <td className="p-3">{sub.uploader_name || "-"}</td>
                                        <td className="p-3">{sub.filename}</td>
                                        <td className="p-3 font-mono text-xs">{sub.id}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(sub.upload_date).toLocaleString('zh-TW')}
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${sub.status === 'validated'
                                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                                }`}>
                                                {sub.status === 'validated' ? '驗證通過' : '驗證失敗'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
