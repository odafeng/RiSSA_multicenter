"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input } from './ui';
import axios from 'axios';
import { Download, Lock, Loader2, AlertCircle } from 'lucide-react';

interface Project {
    id: number;
    name: string;
}

export default function DataDownloader() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectId, setProjectId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/api/projects');
                setProjects(res.data);
                if (res.data.length > 0) {
                    setProjectId(res.data[0].id.toString());
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };
        fetchProjects();
    }, []);

    const handleDownload = async () => {
        if (!projectId || !password) {
            setError("請選擇專案並輸入密碼");
            return;
        }
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append('password', password);

        try {
            const res = await axios.post(`/api/projects/${projectId}/download`, formData, {
                responseType: 'blob'
            });
            // Create download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `project_${projectId}_data.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError("密碼錯誤");
            } else if (err.response?.status === 400) {
                setError("目前無有效資料可供下載");
            } else {
                setError("下載失敗，請稍後再試");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
                <label className="text-xs text-slate-500 font-medium mb-1 block">選擇專案</label>
                <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex-1">
                <label className="text-xs text-slate-500 font-medium mb-1 block">下載密碼</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="請輸入密碼"
                        className="pl-10"
                    />
                </div>
            </div>
            <Button onClick={handleDownload} disabled={loading} className="whitespace-nowrap">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                下載合併資料
            </Button>
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}
        </div>
    );
}
