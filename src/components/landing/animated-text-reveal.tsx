"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWords?: string[];
  highlightClassName?: string;
}

export function AnimatedTextReveal({
  text,
  className = "",
  delay = 0,
  highlightWords = [],
  highlightClassName = "",
}: AnimatedTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".atr-char");

    gsap.set(chars, {
      opacity: 0,
      y: 40,
      rotateX: -90,
      transformOrigin: "bottom center",
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      stagger: {
        each: 0.03,
        from: "start",
      },
      delay,
    });

    return () => {
      gsap.killTweensOf(chars);
    };
  }, [delay, text]);

  const words = text.split(" ");

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ perspective: "1000px" }}
      aria-label={text}
    >
      {words.map((word, wordIndex) => {
        const isHighlighted = highlightWords.includes(word);
        return (
          <span
            key={wordIndex}
            className={`inline-block ${isHighlighted ? highlightClassName : ""}`}
          >
            {word.split("").map((char, charIndex) => (
              <span
                key={charIndex}
                className="atr-char inline-block will-change-transform"
                style={{ display: "inline-block" }}
              >
                {char}
              </span>
            ))}
            {wordIndex < words.length - 1 && (
              <span className="atr-char inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
