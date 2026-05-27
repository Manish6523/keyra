"use client";

import { useState, useEffect } from "react";
import { fetchActivity } from "@/lib/db";
import { motion } from "framer-motion";

interface ActivityItem {
  action: string;
  keyLabel: string;
  serviceName: string;
  createdAt: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchActivity(5).then(setActivities).catch(console.error);
  }, []);

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-sm text-slate-400 dark:text-keyra-text/40">
          No recent activity.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-white/[0.02] last:border-0"
          >
            <div>
              <span className="text-slate-700 dark:text-keyra-text/70 font-medium">
                {a.action}
              </span>
              <span className="ml-2 text-slate-500 dark:text-keyra-text/40">
                — {a.keyLabel || a.serviceName}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-keyra-text/30">
              {new Date(a.createdAt).toLocaleDateString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
