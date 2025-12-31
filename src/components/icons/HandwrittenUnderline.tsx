import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenUnderlineProps {
  className?: string;
}

const HandwrittenUnderline = ({ className }: HandwrittenUnderlineProps) => {
  return (
    <svg
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-5", className)}
      preserveAspectRatio="none"
    >
      <style>
        {`
          .underline-path {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            animation: drawLine 0.6s ease-out forwards;
          }
          .underline-path-1 { animation-delay: 0.3s; }
          .underline-path-2 { animation-delay: 0.5s; }
          .underline-path-3 { animation-delay: 0.7s; }
          
          @keyframes drawLine {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      {/* Main underline - organic hand-drawn feel */}
      <path
        className="underline-path underline-path-1"
        d="M1 7 Q 8 5, 18 8 T 38 6 Q 52 4, 65 7 T 85 5 Q 94 4, 99 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Second pass - slightly offset like real pen stroke */}
      <path
        className="underline-path underline-path-2"
        d="M2 11 Q 12 9, 25 12 T 48 10 Q 60 8, 72 11 T 92 9 Q 97 8, 99 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Third accent stroke - adds natural imperfection */}
      <path
        className="underline-path underline-path-3"
        d="M3 15 Q 15 13, 28 16 T 55 14 Q 68 12, 80 15 T 97 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
};

export default HandwrittenUnderline;
