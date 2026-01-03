"use client";
import React, { useState } from 'react';
import { Button, Input } from './ui';
import axios from 'axios';
import { Download, Lock } from 'lucide-react';

export default function DataDownloader() {
    const [projectId, setProjectId] = useState("1");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!password) {
            alert("請輸入密碼");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('password', password);

            const response = await axios.post(`/api/projects/${projectId}/download`, formData, {
                responseType: 'blob', // Important
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `multicenter_data_project_${projectId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || "下載失敗 (密碼錯誤或無資料)";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto flex gap-2 items-center bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                    <Input
                        value={projectId}
                        onChange={e => setProjectId(e.target.value)}
                        placeholder="專案 ID"
                        className="w-20"
                    />
                    <div className="relative flex-1">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="password"
                            placeholder="下載密碼 (預設 000000)"
                            className="pl-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <Button onClick={handleDownload} disabled={loading}>
                {loading ? "..." : <Download className="w-4 h-4" />}
            </Button>
        </div>
    );
}
