"use client";
import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { Trash2, Edit2, Check, X, RefreshCw, Loader2, Plus, Save, Download, Settings, List, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    created_at: string;
}

type TabType = 'list' | 'create' | 'schema' | 'settings';

export default function ProjectManager() {
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Create project state
    const [newProjectName, setNewProjectName] = useState("");

    // Schema state
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [jsonContent, setJsonContent] = useState(JSON.stringify({
        columns: [
            { name: "center_id", required: true, type: "string" },
            { name: "case_id", required: true, type: "string" }
        ]
    }, null, 2));
    const [schemaVersion, setSchemaVersion] = useState<number | null>(null);

    // Settings state
    const [password, setPassword] = useState("");

    // Status message
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/projects');
            setProjects(res.data);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: "讀取專案列表失敗" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("確定要刪除此專案？所有相關資料也會被刪除。")) return;
        try {
            await axios.delete(`/api/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
            setStatus({ type: 'success', msg: "專案已刪除" });
        } catch (error) {
            setStatus({ type: 'error', msg: "刪除失敗" });
        }
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setEditName(project.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const saveEdit = async (id: number) => {
        try {
            await axios.put(`/api/projects/${id}`, { name: editName });
            setProjects(projects.map(p => p.id === id ? { ...p, name: editName } : p));
            setEditingId(null);
            setStatus({ type: 'success', msg: "名稱已更新" });
        } catch (error) {
            setStatus({ type: 'error', msg: "更新失敗" });
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            setStatus({ type: 'error', msg: "請輸入專案名稱" });
            return;
        }
        try {
            const res = await axios.post('/api/projects', { name: newProjectName });
            setSelectedProjectId(res.data.id.toString());
            setNewProjectName("");
            await fetchProjects();
            setStatus({ type: 'success', msg: `專案 '${res.data.name}' 建立成功! ID: ${res.data.id}` });
            setActiveTab('schema'); // Switch to schema tab after creating
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || "建立專案失敗" });
        }
    };

    const handleLoadSchema = async () => {
        if (!selectedProjectId) {
            setStatus({ type: 'error', msg: "請先選擇專案" });
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`/api/projects/${selectedProjectId}/schemas/latest`);
            setJsonContent(JSON.stringify(res.data.structure, null, 2));
            setSchemaVersion(res.data.version);
            setStatus({ type: 'success', msg: `已載入 Schema (版本 ${res.data.version})` });
        } catch (err: any) {
            if (err.response?.status === 404) {
                setStatus({ type: 'error', msg: "此專案尚未設定 Schema" });
            } else {
                setStatus({ type: 'error', msg: "載入失敗" });
            }
            setSchemaVersion(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSchema = async () => {
        if (!selectedProjectId) {
            setStatus({ type: 'error', msg: "請先選擇專案" });
            return;
        }
        try {
            const parsed = JSON.parse(jsonContent);
            const res = await axios.post(`/api/projects/${selectedProjectId}/schemas`, { structure: parsed });
            setSchemaVersion(res.data.version);
            setStatus({ type: 'success', msg: `Schema 儲存成功! (版本 ${res.data.version})` });
        } catch (err: any) {
            setStatus({ type: 'error', msg: "JSON 格式錯誤或伺服器錯誤" });
        }
    };

    const handleSavePassword = async () => {
        if (!selectedProjectId || !password) {
            setStatus({ type: 'error', msg: "請選擇專案並輸入新密碼" });
            return;
        }
        setLoading(true);
        try {
            await axios.put(`/api/projects/${selectedProjectId}`, { download_password: password });
            setPassword("");
            setStatus({ type: 'success', msg: "密碼更新成功" });
        } catch (error) {
            setStatus({ type: 'error', msg: "更新失敗" });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'list' as TabType, label: '專案列表', icon: List },
        { id: 'create' as TabType, label: '建立新專案', icon: Plus },
        { id: 'schema' as TabType, label: 'Schema 維護', icon: FileText },
        { id: 'settings' as TabType, label: '專案設定', icon: Settings },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>專案管理</CardTitle>
                <div className="flex gap-1 border-b mt-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setStatus(null); }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {/* Tab: Project List */}
                {activeTab === 'list' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={fetchProjects} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-3 font-medium w-16">ID</th>
                                        <th className="p-3 font-medium">專案名稱</th>
                                        <th className="p-3 font-medium w-32">建立時間</th>
                                        <th className="p-3 font-medium w-24 text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">尚無專案</td>
                                        </tr>
                                    ) : (
                                        projects.map((project) => (
                                            <tr key={project.id} className="border-t hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-mono text-xs">{project.id}</td>
                                                <td className="p-3">
                                                    {editingId === project.id ? (
                                                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8" />
                                                    ) : (
                                                        <span className="font-medium">{project.name}</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-muted-foreground text-xs">
                                                    {new Date(project.created_at).toLocaleDateString('zh-TW')}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {editingId === project.id ? (
                                                        <div className="flex gap-1 justify-center">
                                                            <Button size="sm" variant="ghost" onClick={() => saveEdit(project.id)}><Check className="w-4 h-4 text-green-500" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4 text-red-500" /></Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1 justify-center">
                                                            <Button size="sm" variant="ghost" onClick={() => startEdit(project)}><Edit2 className="w-4 h-4" /></Button>
                                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(project.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Create Project */}
                {activeTab === 'create' && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">建立新的多中心研究專案</p>
                        <div className="flex gap-4">
                            <Input
                                placeholder="專案名稱 (範例: 短期預後追蹤)"
                                value={newProjectName}
                                onChange={e => setNewProjectName(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleCreateProject}>
                                <Plus className="w-4 h-4 mr-2" /> 建立專案
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tab: Schema */}
                {activeTab === 'schema' && (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <label className="text-sm font-medium">選擇專案:</label>
                            <select
                                value={selectedProjectId}
                                onChange={e => { setSelectedProjectId(e.target.value); setSchemaVersion(null); }}
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                            >
                                <option value="">-- 請選擇 --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
                                ))}
                            </select>
                            <Button variant="outline" size="sm" onClick={handleLoadSchema} disabled={loading || !selectedProjectId}>
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
                        <Button onClick={handleSaveSchema} className="w-full" disabled={!selectedProjectId}>
                            <Save className="w-4 h-4 mr-2" /> 儲存 Schema (建立新版本)
                        </Button>
                    </div>
                )}

                {/* Tab: Settings */}
                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">選擇專案</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={e => setSelectedProjectId(e.target.value)}
                                    className="h-9 rounded-md border bg-background px-3 text-sm min-w-[200px]"
                                >
                                    <option value="">-- 請選擇 --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">資料下載密碼重設</label>
                                <Input
                                    type="text"
                                    placeholder="輸入新密碼"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSavePassword} disabled={loading || !password || !selectedProjectId}>
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />} 儲存
                            </Button>
                        </div>
                    </div>
                )}

                {/* Status Message */}
                {status && (
                    <div className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {status.msg}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
