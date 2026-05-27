import { cn } from "@/lib/utils";

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-slate-200 dark:bg-white/5", className)} />;
}

export { Separator };
