"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ApiKey } from "@/store/vault";
import { useVaultStore } from "@/store/vault";
import { detectService } from "@/lib/services";
import { X, Plus } from "lucide-react";
import { PasswordGenerator } from "./password-generator";

interface KeyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<ApiKey>) => void;
  editKey?: ApiKey | null;
}

const environments = [
  { value: "development", label: "Development" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

export function KeyDialog({ open, onClose, onSave, editKey }: KeyDialogProps) {
  const projects = useVaultStore((s) => s.projects);
  const [label, setLabel] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [projectId, setProjectId] = useState("");
  const [environment, setEnvironment] = useState<
    "development" | "staging" | "production"
  >("development");
  const [description, setDescription] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      setLabel(editKey?.label || "");
      setServiceName(editKey?.serviceName || "");
      setKeyValue("");
      setProjectId(editKey?.projectId || "");
      setEnvironment(editKey?.environment || "development");
      setDescription(editKey?.description || "");
      setDocsUrl(editKey?.docsUrl || "");
      setExpiryDate(editKey?.expiryDate || "");
      setTags(editKey?.tags || []);
      setTagInput("");
    }
  }, [open, editKey]);

  const detected = keyValue ? detectService(keyValue) : null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<ApiKey> = {
      label,
      serviceName: detected?.name || serviceName,
      projectId: projectId || "",
      environment,
      description,
      docsUrl,
      expiryDate: expiryDate || undefined,
      tags,
    };
    if (keyValue) {
      data.encryptedValue = keyValue;
    }
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-slate-900 dark:text-white">
          {editKey ? "Edit Key" : "Add API Key"}
        </DialogTitle>
        <DialogDescription className="text-slate-500 dark:text-slate-400">
          {editKey
            ? "Update your API key details."
            : "Store a new API key. It will be encrypted before saving."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[68vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Label
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="My API Key"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Service
            </label>
            <Input
              value={detected?.name || serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="OpenAI"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
            Key Value
          </label>
          <div className="flex gap-2">
            <Input
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder={editKey ? "Leave blank to keep existing" : "sk-..."}
              className="font-mono flex-1"
            />
            {!editKey && <PasswordGenerator onUse={setKeyValue} />}
          </div>
          {detected && !editKey && (
            <p className="mt-1.5 text-xs text-emerald-600 dark:text-keyra-mint">
              Detected: {detected.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-keyra-navy px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-keyra-violet/60 focus:ring-2 focus:ring-keyra-violet/20 focus:outline-none transition-all duration-200"
            >
              <option
                value=""
                className="bg-white dark:bg-keyra-navy text-slate-900 dark:text-white"
              >
                No project
              </option>
              {projects.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-white dark:bg-keyra-navy text-slate-900 dark:text-white"
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Environment
            </label>
            <Select
              value={environment}
              onChange={(e) =>
                setEnvironment(
                  e.target.value as "development" | "staging" | "production"
                )
              }
              options={environments}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Expiry Date
            </label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
              Docs URL
            </label>
            <Input
              value={docsUrl}
              onChange={(e) => setDocsUrl(e.target.value)}
              placeholder="https://docs.example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="slate"
                className="cursor-pointer flex items-center gap-1"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-keyra-text/80 mb-1">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-keyra-violet text-white hover:bg-keyra-violet/90"
          >
            {editKey ? "Save Changes" : "Add Key"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
