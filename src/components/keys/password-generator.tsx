"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Wand2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";

interface PasswordGeneratorProps {
  onUse: (password: string) => void;
  trigger?: React.ReactNode;
}

const UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

function generatePassword(
  length: number,
  options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
) {
  let chars = "";
  if (options.upper) chars += UPPERS;
  if (options.lower) chars += LOWERS;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;

  if (!chars) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }

  return password;
}

function getStrength(password: string) {
  let score = 0;
  if (password.length > 8) score += 1;
  if (password.length > 12) score += 1;
  if (password.length > 16) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 3) return { label: "Weak", color: "bg-red-500", textClass: "text-red-500", w: "w-1/4" };
  if (score < 5) return { label: "Fair", color: "bg-amber-500", textClass: "text-amber-500", w: "w-2/4" };
  if (score < 7) return { label: "Good", color: "bg-cyan-500", textClass: "text-cyan-500", w: "w-3/4" };
  if (score >= 7) return { label: "Strong", color: "bg-emerald-500", textClass: "text-emerald-500", w: "w-full" };
  return { label: "Weak", color: "bg-red-500", textClass: "text-red-500", w: "w-1/4" };
}

export function PasswordGenerator({ onUse, trigger }: PasswordGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [length, setLength] = useState(32);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const { copy, copied } = useClipboard(3000);

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const strength = getStrength(password);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="border-slate-200 dark:border-white/10 bg-white dark:bg-keyra-charcoal text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Wand2 className="mr-2 h-4 w-4 text-keyra-violet" />
            Generate
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 border-slate-200 dark:border-white/10 bg-white dark:bg-keyra-charcoal/95 p-4 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-keyra-text"
        align="end"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
              Password Generator
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={regenerate}
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-keyra-navy p-3 font-mono text-xs break-all text-indigo-600 dark:text-keyra-mint">
            {password || "Select options..."}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-keyra-text/70">
              <span>
                Strength:{" "}
                <strong className={strength.textClass}>
                  {strength.label}
                </strong>
              </span>
              <span>{length} chars</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  strength.color,
                  strength.w
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-slate-700 dark:text-white font-medium">
                <label htmlFor="length">Length</label>
                <span>{length}</span>
              </div>
              <input
                id="length"
                type="range"
                min={8}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-keyra-violet h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2">
              {[
                { id: "upper", label: "Uppercase (A-Z)" },
                { id: "lower", label: "Lowercase (a-z)" },
                { id: "numbers", label: "Numbers (0-9)" },
                { id: "symbols", label: "Symbols (!@#$)" },
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between">
                  <label
                    htmlFor={opt.id}
                    className="text-sm text-slate-600 dark:text-white"
                  >
                    {opt.label}
                  </label>
                  <Switch
                    id={opt.id}
                    checked={options[opt.id as keyof typeof options]}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, [opt.id]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-keyra-navy text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              onClick={() => {
                if (password) copy(password);
              }}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              className="flex-1 bg-keyra-violet text-white hover:bg-keyra-violet/90"
              onClick={() => {
                if (password) {
                  onUse(password);
                  setOpen(false);
                }
              }}
              disabled={!password}
            >
              Use This
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
