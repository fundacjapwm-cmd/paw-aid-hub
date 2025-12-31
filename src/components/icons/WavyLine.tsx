import React from "react";
import { cn } from "@/lib/utils";

interface WavyLineProps {
  className?: string;
  variant?: "wave" | "arrow" | "loop";
}

const WavyLine = ({ className, variant = "wave" }: WavyLineProps) => {
  if (variant === "arrow") {
    return (
      <svg
        viewBox="0 0 120 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-24 h-16", className)}
      >
        <path
          d="M10 70 C 30 70, 40 10, 60 10 C 80 10, 70 50, 90 40 C 100 35, 105 30, 110 25"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M100 20 L 110 25 L 105 35"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  if (variant === "loop") {
    return (
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-24 h-14", className)}
      >
        <path
          d="M5 45 C 20 45, 25 15, 45 15 C 65 15, 55 45, 75 45 C 85 45, 90 35, 95 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="45" cy="35" r="15" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-10", className)}
    >
      <path
        d="M5 20 C 25 5, 45 35, 65 20 C 85 5, 105 35, 125 20 C 145 5, 165 35, 195 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default WavyLine;
