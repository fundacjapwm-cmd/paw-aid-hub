import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenUnderlineProps {
  className?: string;
}

const HandwrittenUnderline = ({ className }: HandwrittenUnderlineProps) => {
  return (
    <svg
      viewBox="0 0 100 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-4", className)}
      preserveAspectRatio="none"
    >
      <style>
        {`
          .draw-ltr {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            animation: drawLeftToRight 0.4s ease-out forwards;
          }
          .draw-rtl {
            stroke-dasharray: 150;
            stroke-dashoffset: -150;
            animation: drawRightToLeft 0.4s ease-out forwards;
          }
          .line-1 { animation-delay: 0.3s; }
          .line-2 { animation-delay: 0.7s; }
          .line-3 { animation-delay: 1.1s; }
          
          @keyframes drawLeftToRight {
            to { stroke-dashoffset: 0; }
          }
          @keyframes drawRightToLeft {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* First stroke: left to right */}
      <path
        className="draw-ltr line-1"
        d="M0 5 Q 15 3, 30 6 T 55 4 Q 75 2, 100 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Second stroke: right to left */}
      <path
        className="draw-rtl line-2"
        d="M100 9 Q 80 12, 60 8 T 30 11 Q 15 13, 0 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Third stroke: left to right again */}
      <path
        className="draw-ltr line-3"
        d="M0 13 Q 20 11, 40 14 T 70 12 Q 85 10, 100 13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default HandwrittenUnderline;
