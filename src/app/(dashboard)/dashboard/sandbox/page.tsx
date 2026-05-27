"use client";

import { useState, useEffect } from "react";
import { CryptoSandboxFlow } from "@/components/keys/crypto-sandbox-flow";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Slider } from "@/components/ui/slider";
import { HelpCircle, RefreshCw, Key, Shield, Sparkles, Binary } from "lucide-react";

export default function SandboxPage() {
  const [password, setPassword] = useState("my-super-secret-password");
  const [plaintext, setPlaintext] = useState("Keyra: Premium Client-side E2EE");
  const [ciphertext, setCiphertext] = useState("");
  const [iterations, setIterations] = useState(600000);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  // Pre-generate a valid mock ciphertext so Decrypt mode starts with something nice
  useEffect(() => {
    async function preGenerateCipher() {
      try {
        const enc = new TextEncoder();
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const ivBytes = crypto.getRandomValues(new Uint8Array(12));

        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          enc.encode("my-super-secret-password"),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        );

        const aesKey = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: 600000,
            hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt"]
        );

        const encrypted = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: ivBytes },
          aesKey,
          enc.encode("Decrypted message successfully!")
        );

        const combined = new Uint8Array(
          saltBytes.length + ivBytes.length + encrypted.byteLength
        );
        combined.set(saltBytes, 0);
        combined.set(ivBytes, saltBytes.length);
        combined.set(new Uint8Array(encrypted), saltBytes.length + ivBytes.length);

        setCiphertext(btoa(Array.from(combined, (b) => String.fromCharCode(b)).join("")));
      } catch (e) {
        console.error(e);
      }
    }
    preGenerateCipher();
  }, []);

  const handleRandomizePayload = () => {
    if (mode === "encrypt") {
      const phrases = [
        "sk-live-YOUR_KEYRA_SECRET_KEY",
        "DATABASE_URL=postgresql://keyra_owner:YOUR_KEYRA_DATABASE_PASSWORD@ep-fancy-flower.us-east-1.aws.neon.tech/keyra",
        "JWT_SECRET=YOUR_KEYRA_JWT_SECRET_KEY",
        "SECRET_KEY=YOUR_KEYRA_SECRET_KEY",
      ];
      const randomIdx = Math.floor(Math.random() * phrases.length);
      setPlaintext(phrases[randomIdx]);
    } else {
      // Create random encrypted value
      const mockRandomData = crypto.getRandomValues(new Uint8Array(48));
      setCiphertext(btoa(Array.from(mockRandomData, (b) => String.fromCharCode(b)).join("")));
    }
  };

  const handleRandomizePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const length = 16 + Math.floor(Math.random() * 8);
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (val) => chars[val % chars.length]).join(""));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-500 dark:text-keyra-violet" />
          Cryptographic Reactor Sandbox
        </h1>
        <p className="text-sm text-slate-500 dark:text-keyra-text/50">
          Inspect, configure, and visual-trace client-side Zero-Knowledge encryption and key derivation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Control Card (1/3 Width) */}
        <SpotlightCard className="lg:col-span-1 p-6 bg-white/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] hover:shadow-glow-violet transition-all duration-300">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
                Reactor Parameters
              </h2>

              {/* Mode Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/50 dark:border-white/[0.02] mb-5">
                {(["encrypt", "decrypt"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-200 ${
                      mode === m
                        ? "bg-white dark:bg-keyra-navy text-indigo-600 dark:text-keyra-violet shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {m} Mode
                  </button>
                ))}
              </div>

              {/* Master Password Input */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-keyra-text/50 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-indigo-400" />
                    Master Password
                  </label>
                  <button
                    onClick={handleRandomizePassword}
                    className="text-[10px] text-slate-500 hover:text-indigo-500 dark:hover:text-keyra-violet flex items-center gap-1"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    Randomize
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-keyra-violet transition-all"
                  placeholder="Enter master password..."
                />
              </div>

              {/* PBKDF2 Iterations */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-600 dark:text-keyra-text/50 flex items-center gap-1.5">
                    <Binary className="h-3.5 w-3.5 text-indigo-400" />
                    PBKDF2 Iterations
                  </label>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {iterations.toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={10000}
                  max={1000000}
                  step={10000}
                  value={[iterations]}
                  onValueChange={(val) => setIterations(val[0])}
                  className="py-1 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-slate-400 dark:text-keyra-text/30 font-semibold font-mono">
                  <span>10,000 (FAST)</span>
                  <span>1,000,000 (SECURE)</span>
                </div>
              </div>

              {/* Payload Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-keyra-text/50 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    {mode === "encrypt" ? "Plaintext Payload" : "Base64 Ciphertext"}
                  </label>
                  <button
                    onClick={handleRandomizePayload}
                    className="text-[10px] text-slate-500 hover:text-indigo-500 dark:hover:text-keyra-violet flex items-center gap-1"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    Generate Mock
                  </button>
                </div>
                {mode === "encrypt" ? (
                  <textarea
                    rows={4}
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-keyra-violet transition-all resize-none"
                    placeholder="Enter plaintext to encrypt..."
                  />
                ) : (
                  <textarea
                    rows={4}
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-keyra-violet transition-all resize-none"
                    placeholder="Enter base64 ciphertext to decrypt..."
                  />
                )}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Right Flow Visualizer & Outputs (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          <CryptoSandboxFlow
            password={password}
            plaintext={plaintext}
            ciphertext={ciphertext}
            iterations={iterations}
            mode={mode}
          />
        </div>
      </div>

      {/* Educational Cryptographic Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {[
          {
            title: "Zero-Knowledge Architecture",
            desc: "Keyra strictly enforces Zero-Knowledge. All cryptographic operations take place in client memory. The database only receives unreadable Base64 ciphertext blocks, meaning even database root administrators cannot view your credentials.",
          },
          {
            title: "PBKDF2 Key Hardening",
            desc: "Standard SHA-256 hashes are extremely fast to compute, making them targetable by GPU clusters. PBKDF2 forces the CPU to repeat key derivation 600,000 times, introducing a mathematical barrier that makes brute-force attacks useless.",
          },
          {
            title: "AES-GCM Authenticated Encryption",
            desc: "Galois/Counter Mode (GCM) encrypts data and generates a cryptographic tag representing the payload's integrity. If someone attempts to manually tamper with a ciphertext record in the database, decryption will fail automatically.",
          },
        ].map((concept, i) => (
          <div
            key={i}
            className="p-5 bg-white/40 dark:bg-keyra-navy/20 border border-slate-200/80 dark:border-white/5 rounded-2xl flex flex-col gap-2"
          >
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              {concept.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-keyra-text/60 leading-relaxed">
              {concept.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
