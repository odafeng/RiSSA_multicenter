"use client";
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { AlertCircle, CheckCircle, Download, Loader2 } from 'lucide-react';

export default function SchemaEditor() {
    const [projectId, setProjectId] = useState<string>("");
    const [projectName, setProjectName] = useState("");
    const [jsonContent, setJsonContent] = useState(JSON.stringify({
        columns: [
            { name: "chart_no", required: true, type: "string" },
            { name: "age", required: true, type: "int" }
        ]
    }, null, 2));
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [schemaVersion, setSchemaVersion] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateProject = async () => {
        try {
            const res = await axios.post('/api/projects', { name: projectName });
            setProjectId(res.data.id.toString());
            setStatus({ type: 'success', msg: `專案 '${res.data.name}' 建立成功! ID: ${res.data.id}` });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || "建立專案失敗" });
        }
    };

    const handleLoadSchema = async () => {
        if (!projectId) {
            setStatus({ type: 'error', msg: "請先輸入專案 ID" });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`/api/projects/${projectId}/schemas/latest`);
            setJsonContent(JSON.stringify(res.data.structure, null, 2));
            setSchemaVersion(res.data.version);
            setStatus({ type: 'success', msg: `已載入 Schema (版本 ${res.data.version})` });
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (err.response?.status === 404) {
                setStatus({ type: 'error', msg: "此專案尚未設定 Schema" });
            } else {
                setStatus({ type: 'error', msg: detail || "載入失敗" });
            }
            setSchemaVersion(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSchema = async () => {
        if (!projectId) {
            setStatus({ type: 'error', msg: "請先建立或輸入專案 ID。" });
            return;
        }
        try {
            const parsed = JSON.parse(jsonContent);
            const res = await axios.post(`/api/projects/${projectId}/schemas`, { structure: parsed });
            setSchemaVersion(res.data.version);
            setStatus({ type: 'success', msg: `Schema 儲存成功! (版本 ${res.data.version})` });
        } catch (err: any) {
            setStatus({ type: 'error', msg: "JSON 格式錯誤或伺服器錯誤" });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. 建立新專案</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="專案名稱 (範例: 短期預後追蹤)"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                    />
                    <Button onClick={handleCreateProject}>建立專案</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. 定義 / 編輯資料欄位架構 (Schema JSON)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <label className="text-sm font-medium">專案 ID:</label>
                        <Input
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className="w-24"
                            placeholder="ID"
                        />
                        <Button variant="outline" size="sm" onClick={handleLoadSchema} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4 mr-1" />}
                            載入現有 Schema
                        </Button>
                        {schemaVersion && (
                            <span className="text-xs text-muted-foreground">目前版本: v{schemaVersion}</span>
                        )}
                    </div>
                    <textarea
                        className="w-full h-64 p-4 rounded-md border bg-muted font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={jsonContent}
                        onChange={e => setJsonContent(e.target.value)}
                    />
                    <Button onClick={handleSaveSchema} className="w-full">儲存 Schema (建立新版本)</Button>
                </CardContent>
            </Card>

            {status && (
                <div className={`p-4 rounded-md flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {status.msg}
                </div>
            )}
        </div>
    );
}
