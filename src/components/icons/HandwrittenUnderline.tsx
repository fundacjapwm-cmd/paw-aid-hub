import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenUnderlineProps {
  className?: string;
}

const HandwrittenUnderline = ({ className }: HandwrittenUnderlineProps) => {
  return (
    <svg
      viewBox="0 0 120 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-3", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M2 12 C 15 8, 25 16, 40 10 C 55 4, 65 14, 80 9 C 95 4, 105 12, 118 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default HandwrittenUnderline;
