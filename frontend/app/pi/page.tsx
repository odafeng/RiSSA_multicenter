"use client";
import SchemaEditor from "@/components/SchemaEditor";
import SubmissionList from "@/components/SubmissionList";

export default function PIDashboard() {
    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary">主持人 (PI) 控制台</h1>
                <p className="text-muted-foreground">專案與 Schema 管理</p>
            </header>
            <main className="max-w-6xl mx-auto space-y-8">
                <SchemaEditor />
                <SubmissionList />
            </main>
        </div>
    );
}
