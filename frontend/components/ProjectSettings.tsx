"use client";
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import axios from 'axios';
import { Save } from 'lucide-react';

export default function ProjectSettings() {
    const [projectId, setProjectId] = useState("1");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!password) return;
        setLoading(true);
        try {
            await axios.put(`/api/projects/${projectId}`, {
                download_password: password
            });
            alert("密碼更新成功");
            setPassword("");
        } catch (error) {
            console.error(error);
            alert("更新失敗");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>專案設定</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">專案 ID</label>
                        <Input
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className="w-24"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">資料下載密碼重設</label>
                        <Input
                            type="text"
                            placeholder="輸入新密碼 (留白不修改)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={loading || !password}>
                        {loading ? "..." : <><Save className="w-4 h-4 mr-2" /> 儲存</>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
