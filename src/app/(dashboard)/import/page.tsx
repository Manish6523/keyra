"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useVaultStore } from "@/store/vault";
import { detectService } from "@/lib/services";
import { createKey } from "@/lib/db";
import { Upload, FileText, Download, Check, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function ImportPage() {
  const addKey = useVaultStore((s) => s.addKey);
  const projects = useVaultStore((s) => s.projects);
  const [envText, setEnvText] = useState("");
  const [projectId, setProjectId] = useState("");
  const [imported, setImported] = useState<{ label: string; service: string }[]>([]);
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseEnv = (text: string) => {
    const lines = text.split("\n");
    const keys: { key: string; value: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && value) keys.push({ key, value });
    }
    return keys;
  };

  const handleImport = async () => {
    if (isImporting) return;
    setIsImporting(true);
    setError("");
    setImported([]);
    try {
      const parsed = parseEnv(envText);
      if (parsed.length === 0) {
        setError("No valid KEY=VALUE pairs found.");
        return;
      }
      const results: { label: string; service: string }[] = [];
      for (const { key, value } of parsed) {
        const detected = detectService(value);
        const serviceName = detected?.name || "Custom";
        const label = key
          .replace(/_/g, " ")
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        const dbKey = await createKey({
          projectId: projectId || "",
          serviceName,
          label,
          encryptedValue: value,
          environment: "development",
          tags: [],
          archived: false,
          favorite: false,
        });
        addKey(dbKey);
        results.push({ label, service: serviceName });
      }

      // Success celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

      setImported(results);
      setEnvText("");
    } catch {
      setError("Failed to parse file.");
    } finally {
      setIsImporting(false);
      // Auto-dismiss success message after 7 seconds
      setTimeout(() => setImported([]), 7000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEnvText((event.target?.result as string) || "");
    };
    reader.readAsText(file);
  };

  const handleExportBackup = () => {
    const keysList = useVaultStore.getState().keys;
    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      keys: keysList,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyra-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Minor success celebration for backup export
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Import & Backup
        </h1>
        <p className="text-sm text-slate-500 dark:text-keyra-text/50">
          Import keys from configuration files or export local vaults.
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import from .env file
              </h2>
              <p className="text-sm text-slate-500 dark:text-keyra-text/50 mt-1">
                Upload your local environment file or paste variable lines directly below.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="border-slate-200 dark:border-white/10"
              >
                <Upload className="mr-2 h-4 w-4 text-indigo-600 dark:text-keyra-violet" />
                Upload .env File
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".env,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5 max-w-sm">
              <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80">
                Import to Project
              </label>
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                options={[
                  { value: "", label: "No Project (Root)" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>

            <Textarea
              value={envText}
              onChange={(e) => setEnvText(e.target.value)}
              placeholder={`OPENAI_API_KEY=sk-...\nSTRIPE_SECRET_KEY=sk_live_...\nDATABASE_URL=postgres://...`}
              rows={8}
              className="font-mono text-xs p-3 bg-slate-50 dark:bg-keyra-charcoal/50 border-slate-200 dark:border-white/5"
            />

            {error && (
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-keyra-red">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!envText.trim() || isImporting}
              className="w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : "Import Keys"}
            </Button>
          </SpotlightCard>
        </ScrollReveal>

        {imported.length > 0 && (
          <ScrollReveal>
            <div className="rounded-xl border border-emerald-200 dark:border-keyra-mint/20 bg-emerald-50/50 dark:bg-keyra-mint/5 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-keyra-mint/20 text-emerald-600 dark:text-keyra-mint">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-emerald-800 dark:text-keyra-mint text-base">
                  Successfully imported {imported.length} key{imported.length !== 1 ? "s" : ""}
                </h3>
              </div>
              <div className="space-y-1.5">
                {imported.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-keyra-text/70"
                  >
                    <Badge variant="slate">{item.service}</Badge>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <SpotlightCard className="p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Export Local Backup
              </h2>
              <p className="text-sm text-slate-500 dark:text-keyra-text/50 mt-1">
                Save a local copy of your current keys as an encrypted backup.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportBackup}
              className="border-slate-200 dark:border-white/10"
            >
              <Download className="mr-2 h-4 w-4 text-indigo-600 dark:text-keyra-violet" />
              Export Encrypted Backup
            </Button>
          </SpotlightCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
