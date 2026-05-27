"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Cpu,
  Dices,
  FileText,
  Binary,
  Play,
  HelpCircle,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

interface CryptoSandboxFlowProps {
  password?: string;
  plaintext?: string;
  ciphertext?: string;
  iterations?: number;
  mode: "encrypt" | "decrypt";
}

interface CryptoData {
  salt: Uint8Array | null;
  iv: Uint8Array | null;
  derivedKey: Uint8Array | null;
  ciphertext: string | null;
  plaintext: string | null;
}

export function CryptoSandboxFlow({
  password = "password123",
  plaintext = "Hello Keyra!",
  ciphertext = "",
  iterations = 600000,
  mode = "encrypt",
}: CryptoSandboxFlowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<1 | 1.5 | 2>(1.5);
  const [activeStep, setActiveStep] = useState<"idle" | "deriving" | "encrypting" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const [cryptoData, setCryptoData] = useState<CryptoData>({
    salt: null,
    iv: null,
    derivedKey: null,
    ciphertext: null,
    plaintext: null,
  });

  // Calculate actual cryptographic values asynchronously
  useEffect(() => {
    async function runCrypto() {
      if (!password) return;

      const enc = new TextEncoder();
      const dec = new TextDecoder();

      if (mode === "encrypt") {
        if (!plaintext) return;
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const ivBytes = crypto.getRandomValues(new Uint8Array(12));

        // PBKDF2 Key Derivation
        const keyMaterial = await crypto.subtle.importKey(
          "raw",
          enc.encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        );

        const aesKey = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: iterations,
            hash: "SHA-256",
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          true, // exportable for display
          ["encrypt", "decrypt"]
        );

        // Export derived key raw bytes to show in hex
        const exportedKey = await crypto.subtle.exportKey("raw", aesKey);
        const derivedKeyBytes = new Uint8Array(exportedKey);

        // AES-GCM Encryption
        const encryptedBuffer = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: ivBytes },
          aesKey,
          enc.encode(plaintext)
        );

        // Combine salt, iv, and ciphertext
        const combined = new Uint8Array(
          saltBytes.length + ivBytes.length + encryptedBuffer.byteLength
        );
        combined.set(saltBytes, 0);
        combined.set(ivBytes, saltBytes.length);
        combined.set(new Uint8Array(encryptedBuffer), saltBytes.length + ivBytes.length);

        const b64Ciphertext = btoa(
          Array.from(combined, (b) => String.fromCharCode(b)).join("")
        );

        setCryptoData({
          salt: saltBytes,
          iv: ivBytes,
          derivedKey: derivedKeyBytes,
          ciphertext: b64Ciphertext,
          plaintext: plaintext,
        });
      } else {
        // Decrypt Mode
        if (!ciphertext) return;
        try {
          const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
          const saltBytes = combined.slice(0, 16);
          const ivBytes = combined.slice(16, 28);
          const dataBytes = combined.slice(28);

          const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
          );

          const aesKey = await crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt: saltBytes,
              iterations: iterations,
              hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
          );

          const exportedKey = await crypto.subtle.exportKey("raw", aesKey);
          const derivedKeyBytes = new Uint8Array(exportedKey);

          const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBytes },
            aesKey,
            dataBytes
          );

          setCryptoData({
            salt: saltBytes,
            iv: ivBytes,
            derivedKey: derivedKeyBytes,
            ciphertext: ciphertext,
            plaintext: dec.decode(decryptedBuffer),
          });
        } catch {
          // Fallback placeholders on decryption failure
          setCryptoData({
            salt: new Uint8Array(16).map((_, i) => i + 1),
            iv: new Uint8Array(12).map((_, i) => i + 5),
            derivedKey: new Uint8Array(32).map((_, i) => i + 10),
            ciphertext: ciphertext,
            plaintext: "Decryption Failed (Invalid Key/Payload)",
          });
        }
      }
    }

    runCrypto();
  }, [password, plaintext, ciphertext, iterations, mode]);

  // Handle animation stepping
  useEffect(() => {
    if (!isPlaying) return;

    setActiveStep("deriving");
    setProgress(0);

    const stepDuration = 2000 / animationSpeed;

    // Step 1: PBKDF2 Derivation Timer
    const deriveTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(deriveTimer);
          return 100;
        }
        return prev + 10;
      });
    }, stepDuration / 10);

    // Transition to encryption
    const encryptTimeout = setTimeout(() => {
      setActiveStep("encrypting");
      setProgress(0);

      const encryptTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(encryptTimer);
            return 100;
          }
          return prev + 20;
        });
      }, stepDuration / 5);

      // Complete
      const completeTimeout = setTimeout(() => {
        setActiveStep("complete");
        setIsPlaying(false);
      }, stepDuration);

      return () => {
        clearInterval(encryptTimer);
        clearTimeout(completeTimeout);
      };
    }, stepDuration + 300);

    return () => {
      clearInterval(deriveTimer);
      clearTimeout(encryptTimeout);
    };
  }, [isPlaying, animationSpeed]);

  const handleStart = () => {
    setIsPlaying(true);
    setActiveStep("idle");
    setProgress(0);
  };

  // Hex helpers
  const toHex = (arr: Uint8Array | null) => {
    if (!arr) return "Deriving...";
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 24) + "...";
  };

  const getDashedPath = (step: string) => {
    if (activeStep === "idle") return false;
    if (step === "deriving" && activeStep === "deriving") return true;
    if (step === "encrypting" && activeStep === "encrypting") return true;
    if (activeStep === "complete") return false;
    return false;
  };

  const nodeHelp = useMemo(() => {
    return {
      password: {
        title: "Master Password",
        description: "The client-side secret entered by the user. It is never stored on the database or transmitted over the network in plaintext. Instead, it serves as the input material for key derivation.",
      },
      salt: {
        title: "Cryptographic Salt",
        description: "A 16-byte random value unique to each project. Salt prevents pre-computed rainbow table attacks by ensuring that identical passwords derive completely different keys.",
      },
      pbkdf2: {
        title: "PBKDF2 Key Derivation",
        description: `Password-Based Key Derivation Function 2. It hashes the password combined with the salt through ${iterations.toLocaleString()} rounds of SHA-256. The high iteration count makes brute-force attacks computationally infeasible.`,
      },
      derivedKey: {
        title: "Derived AES Key",
        description: "A 256-bit symmetric encryption key produced by PBKDF2. This key exists purely in client memory (sessionStorage) and is used directly by the AES-GCM engine.",
      },
      iv: {
        title: "Initialization Vector (IV)",
        description: "A unique, random 12-byte nonce generated for every single key creation or update. It ensures that encrypting the same secret value multiple times yields different ciphertext.",
      },
      aesgcm: {
        title: "AES-GCM 256 Engine",
        description: "Advanced Encryption Standard in Galois/Counter Mode. It encrypts the secret payload and guarantees authenticity and integrity using an authentication tag (AEAD).",
      },
      payload: {
        title: mode === "encrypt" ? "Plaintext Payload" : "Ciphertext Payload",
        description: mode === "encrypt"
          ? "The raw API key or password that you want to store securely. Decrypted locally in your browser."
          : "The Base64 encoded payload retrieved from the database, consisting of: Salt + IV + Encrypted Bytes.",
      },
      output: {
        title: mode === "encrypt" ? "Encrypted Ciphertext" : "Decrypted Plaintext",
        description: mode === "encrypt"
          ? "The final secure representation (Base64) stored in the database. Safe from database administrators or eavesdroppers."
          : "The original decrypted secret, ready to be copied or used in your development environment.",
      },
    };
  }, [iterations, mode]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Reactor Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[340px] md:min-h-[400px] bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col justify-between shadow-inner backdrop-blur-md">
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-grid-small-slate-200/[0.03] dark:bg-grid-small-white/[0.02] pointer-events-none" />

        {/* Header Controls */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-keyra-mint animate-pulse" : "bg-slate-500"}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-keyra-text/40">
              {activeStep === "idle" && "Reactor Standby"}
              {activeStep === "deriving" && "PBKDF2 Iterating..."}
              {activeStep === "encrypting" && (mode === "encrypt" ? "AES-GCM Encrypting..." : "AES-GCM Decrypting...")}
              {activeStep === "complete" && "Flow Complete"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed selector */}
            <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-keyra-navy/60 border border-slate-300/30 dark:border-white/5 rounded-lg p-1">
              {([1, 1.5, 2] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setAnimationSpeed(speed)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                    animationSpeed === speed
                      ? "bg-indigo-600 dark:bg-keyra-violet text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleStart}
              disabled={isPlaying}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-keyra-violet dark:hover:bg-keyra-violet/90 text-white font-medium flex items-center gap-1.5 h-8 px-3 rounded-lg shadow-glow-violet"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Reactor
            </Button>
          </div>
        </div>

        {/* SVG Node Pipeline */}
        <div className="flex-1 w-full relative min-h-[220px]">
          <svg
            viewBox="0 0 800 400"
            className="absolute inset-0 w-full h-full select-none"
          >
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="violet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#7C5CFC" stopOpacity="1" />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#00E5A0" stopOpacity="1" />
                <stop offset="100%" stopColor="#00E5A0" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* PIPELINE LINES */}
            {/* Password to PBKDF2 */}
            <path
              d="M 100 100 C 200 100, 220 180, 320 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {getDashedPath("deriving") && (
              <motion.path
                d="M 100 100 C 200 100, 220 180, 320 180"
                fill="none"
                stroke="#7C5CFC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* Salt to PBKDF2 */}
            <path
              d="M 100 260 C 200 260, 220 180, 320 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {getDashedPath("deriving") && (
              <motion.path
                d="M 100 260 C 200 260, 220 180, 320 180"
                fill="none"
                stroke="#7C5CFC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* PBKDF2 to Derived Key & AES-GCM */}
            <path
              d="M 320 180 L 560 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {(activeStep === "encrypting" || activeStep === "complete") && (
              <motion.path
                d="M 320 180 L 560 180"
                fill="none"
                stroke="#00D4FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* IV to AES-GCM */}
            <path
              d="M 440 60 C 440 120, 500 180, 560 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {getDashedPath("encrypting") && (
              <motion.path
                d="M 440 60 C 440 120, 500 180, 560 180"
                fill="none"
                stroke="#00E5A0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* Payload to AES-GCM */}
            <path
              d="M 440 300 C 440 240, 500 180, 560 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {getDashedPath("encrypting") && (
              <motion.path
                d="M 440 300 C 440 240, 500 180, 560 180"
                fill="none"
                stroke="#00E5A0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* AES-GCM to Output */}
            <path
              d="M 560 180 L 740 180"
              fill="none"
              stroke="currentColor"
              className="text-slate-200/80 dark:text-white/[0.04]"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {activeStep === "complete" && (
              <motion.path
                d="M 560 180 L 740 180"
                fill="none"
                stroke="#00E5A0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6, 12"
                animate={{ strokeDashoffset: [-100, 0] }}
                transition={{
                  repeat: 1,
                  duration: 1 / animationSpeed,
                  ease: "linear",
                }}
              />
            )}

            {/* 1. PASSWORD NODE */}
            <foreignObject x={40} y={40} width={120} height={120} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("password")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-keyra-violet group-hover:border-indigo-500 dark:group-hover:border-keyra-violet group-hover:shadow-glow-violet transition-all duration-300">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1.5 uppercase tracking-wider">Password</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[100px] truncate font-bold">
                  {password.slice(0, 10)}
                </span>
              </div>
            </foreignObject>

            {/* 2. SALT NODE */}
            <foreignObject x={40} y={200} width={120} height={120} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("salt")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-500 dark:text-keyra-violet group-hover:border-indigo-400 dark:group-hover:border-keyra-violet group-hover:shadow-glow-violet transition-all duration-300">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1.5 uppercase tracking-wider">Salt</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[100px] truncate font-bold">
                  {toHex(cryptoData.salt)}
                </span>
              </div>
            </foreignObject>

            {/* 3. PBKDF2 NODE */}
            <foreignObject x={260} y={120} width={120} height={150} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("pbkdf2")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-center transition-all duration-500 ${
                  activeStep === "deriving"
                    ? "border-keyra-violet shadow-glow-violet text-keyra-violet scale-105"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:border-indigo-500"
                }`}>
                  <Cpu className={`h-7 w-7 ${activeStep === "deriving" ? "animate-spin" : ""}`} />
                  
                  {/* Iteration circle loader */}
                  {activeStep === "deriving" && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={175}
                        strokeDashoffset={175 - (175 * progress) / 100}
                        className="text-keyra-violet opacity-60 transition-all duration-100"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-2.5 uppercase tracking-wider">PBKDF2 Engine</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-keyra-text/30 font-bold">
                  {iterations.toLocaleString()} iter
                </span>
              </div>
            </foreignObject>

            {/* 4. DERIVED KEY NODE */}
            <foreignObject x={390} y={145} width={100} height={100} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("derivedKey")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`h-10 w-10 rounded-lg bg-white dark:bg-slate-900 border flex items-center justify-center transition-all duration-500 ${
                  activeStep === "encrypting" || activeStep === "complete"
                    ? "border-keyra-cyan text-keyra-cyan shadow-glow-cyan"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                }`}>
                  <Binary className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1 uppercase tracking-wider">AES Key</span>
                <span className="text-[8px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[80px] truncate font-bold">
                  {activeStep === "encrypting" || activeStep === "complete" ? toHex(cryptoData.derivedKey) : "Pending"}
                </span>
              </div>
            </foreignObject>

            {/* 5. IV NODE */}
            <foreignObject x={390} y={10} width={100} height={100} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("iv")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-keyra-mint group-hover:border-keyra-mint group-hover:shadow-glow-mint transition-all duration-300">
                  <Dices className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1 uppercase tracking-wider">IV Nonce</span>
                <span className="text-[8px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[80px] truncate font-bold">
                  {toHex(cryptoData.iv)}
                </span>
              </div>
            </foreignObject>

            {/* 6. PAYLOAD NODE */}
            <foreignObject x={390} y={250} width={100} height={100} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("payload")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-keyra-mint group-hover:border-keyra-mint group-hover:shadow-glow-mint transition-all duration-300">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1 uppercase tracking-wider">
                  {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
                </span>
                <span className="text-[8px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[90px] truncate font-bold">
                  {mode === "encrypt" ? plaintext.slice(0, 12) : ciphertext.slice(0, 12)}
                </span>
              </div>
            </foreignObject>

            {/* 7. AES-GCM ENGINE NODE */}
            <foreignObject x={500} y={120} width={120} height={150} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("aesgcm")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border flex items-center justify-center transition-all duration-500 ${
                  activeStep === "encrypting"
                    ? "border-keyra-mint text-keyra-mint shadow-glow-mint scale-105"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 group-hover:border-keyra-mint"
                }`}>
                  <ShieldCheck className={`h-7 w-7 ${activeStep === "encrypting" ? "animate-pulse" : ""}`} />
                  {activeStep === "encrypting" && (
                    <div className="absolute inset-0 border border-keyra-mint/40 rounded-2xl animate-ping opacity-45 pointer-events-none" />
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-2.5 uppercase tracking-wider">AES-GCM Engine</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-keyra-text/30 font-bold">256-bit AEAD</span>
              </div>
            </foreignObject>

            {/* 8. OUTPUT NODE */}
            <foreignObject x={690} y={145} width={100} height={100} className="overflow-visible">
              <div
                className="flex flex-col items-center justify-center cursor-help group w-full h-full text-center"
                onMouseEnter={() => setHoveredNode("output")}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className={`h-12 w-12 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-center transition-all duration-500 ${
                  activeStep === "complete"
                    ? "border-keyra-mint text-keyra-mint shadow-glow-mint"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                }`}>
                  <Binary className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-keyra-text/40 mt-1.5 uppercase tracking-wider">Output</span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-keyra-text/30 max-w-[90px] truncate font-bold">
                  {activeStep === "complete"
                    ? (mode === "encrypt" ? cryptoData.ciphertext?.slice(0, 10) : cryptoData.plaintext?.slice(0, 10))
                    : "Standby"}
                </span>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Dynamic Tooltip & Hex Inspector HUD (Absolute positioning below SVG pipeline) */}
        <div className="h-16 flex items-center px-4 bg-white dark:bg-keyra-navy/60 border border-slate-200 dark:border-white/5 rounded-xl select-text shrink-0 z-10 transition-all duration-200">
          <AnimatePresence mode="wait">
            {hoveredNode ? (
              <motion.div
                key={hoveredNode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-start gap-2.5 text-xs text-left"
              >
                <Info className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {nodeHelp[hoveredNode as keyof typeof nodeHelp]?.title}
                  </strong>
                  <span className="text-slate-600 dark:text-keyra-text/60 ml-2 leading-relaxed">
                    {nodeHelp[hoveredNode as keyof typeof nodeHelp]?.description}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-between items-center text-xs text-slate-500 dark:text-keyra-text/50 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Hover over any reactor node to inspect its cryptographic role and parameters.</span>
                </div>
                {activeStep === "complete" && (
                  <span className="text-emerald-600 dark:text-keyra-mint font-semibold uppercase tracking-wider animate-pulse">
                    ✓ Transaction Signed & Saved locally
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inspector Variables Output Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Input & Key Derivation variables */}
        <div className="bg-white/60 dark:bg-keyra-navy/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-keyra-text/40 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            PBKDF2 Inspector Parameters
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">Master Password:</span>
              <span className="text-slate-800 dark:text-white font-bold select-all">{password}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">PBKDF2 Salt (Hex):</span>
              <span className="text-slate-800 dark:text-white truncate max-w-[200px] select-all">
                {cryptoData.salt ? Array.from(cryptoData.salt).map(b => b.toString(16).padStart(2, '0')).join('') : "Awaiting Reactor..."}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">Iterations count:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold select-all">{iterations.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-keyra-text/40">Derived AES-256 Key:</span>
              <span className="text-slate-800 dark:text-white truncate max-w-[200px] select-all font-semibold">
                {activeStep === "encrypting" || activeStep === "complete"
                  ? Array.from(cryptoData.derivedKey || []).map(b => b.toString(16).padStart(2, '0')).join('')
                  : "Awaiting Derivation..."}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Symmetric GCM variables */}
        <div className="bg-white/60 dark:bg-keyra-navy/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-keyra-text/40 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            AES-GCM Inspector Parameters
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">GCM Nonce IV (Hex):</span>
              <span className="text-slate-800 dark:text-white truncate max-w-[200px] select-all">
                {cryptoData.iv ? Array.from(cryptoData.iv).map(b => b.toString(16).padStart(2, '0')).join('') : "Awaiting Reactor..."}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">Mode of Operation:</span>
              <span className="text-emerald-600 dark:text-keyra-mint font-semibold uppercase">{mode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-keyra-text/40">Input payload:</span>
              <span className="text-slate-800 dark:text-white truncate max-w-[200px] select-all">
                {mode === "encrypt" ? plaintext : ciphertext}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-keyra-text/40">Output Payload:</span>
              <span className="text-slate-800 dark:text-white truncate max-w-[200px] select-all font-semibold">
                {activeStep === "complete"
                  ? (mode === "encrypt" ? cryptoData.ciphertext : cryptoData.plaintext)
                  : "Awaiting Operation..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
