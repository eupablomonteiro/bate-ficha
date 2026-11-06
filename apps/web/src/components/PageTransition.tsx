"use client";

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAnimation } from "@/context/AnimationContext";

interface BilliardBall {
  number: number;
  color: string;
  striped?: boolean;
}

const BILLIARD_BALLS: BilliardBall[] = [
  { number: 1, color: "#facc15" },
  { number: 2, color: "#2563eb" },
  { number: 3, color: "#dc2626" },
  { number: 4, color: "#7c3aed" },
  { number: 5, color: "#ea580c" },
  { number: 6, color: "#16a34a" },
  { number: 7, color: "#991b1b" },
  { number: 8, color: "#18181b" },
  { number: 9, color: "#facc15", striped: true },
  { number: 10, color: "#2563eb", striped: true },
  { number: 11, color: "#dc2626", striped: true },
  { number: 12, color: "#7c3aed", striped: true },
  { number: 13, color: "#ea580c", striped: true },
  { number: 14, color: "#16a34a", striped: true },
  { number: 15, color: "#991b1b", striped: true },
];

const pickRandomBall = () =>
  BILLIARD_BALLS[Math.floor(Math.random() * BILLIARD_BALLS.length)];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAnimation();
  const [ball, setBall] = useState<BilliardBall | null>(null);

  useEffect(() => {
    if (!settings.enabled) {
      setBall(null);
      return;
    }

    setBall(pickRandomBall());

    const timer = window.setTimeout(() => setBall(null), 750);

    return () => window.clearTimeout(timer);
  }, [pathname, settings.enabled]);

  return (
    <>
      {ball && (
        <div
          className="billiard-transition fixed inset-0 z-[60] overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            key={`${pathname}-${ball.number}`}
            className={`billiard-ball-flight billiard-ball ${
              ball.striped ? "billiard-ball--striped" : ""
            }`}
            style={{ "--ball-color": ball.color } as CSSProperties}
          >
            <span className="billiard-ball__number">
              <span>{ball.number}</span>
            </span>
          </div>
        </div>
      )}

      <div className={settings.enabled ? "page-enter" : undefined}>
        {children}
      </div>
    </>
  );
}
