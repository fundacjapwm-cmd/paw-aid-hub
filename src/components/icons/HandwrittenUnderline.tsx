import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenUnderlineProps {
  className?: string;
}

const HandwrittenUnderline = ({ className }: HandwrittenUnderlineProps) => {
  return (
    <svg
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-4", className)}
      preserveAspectRatio="none"
    >
      {/* Line 1 */}
      <path
        d="M2 6 C 20 4, 35 8, 50 5 C 65 2, 80 7, 98 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Line 2 */}
      <path
        d="M3 11 C 25 9, 40 13, 55 10 C 70 7, 85 12, 97 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Line 3 */}
      <path
        d="M2 16 C 18 14, 38 18, 52 15 C 68 12, 82 17, 98 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Line 4 */}
      <path
        d="M4 21 C 22 19, 42 23, 58 20 C 74 17, 88 22, 96 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default HandwrittenUnderline;
