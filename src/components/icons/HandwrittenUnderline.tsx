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
          .continuous-underline {
            stroke-dasharray: 350;
            stroke-dashoffset: 350;
            animation: drawContinuous 1.2s ease-in-out forwards;
            animation-delay: 0.3s;
          }
          
          @keyframes drawContinuous {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* Single continuous path: left→right, right→left, left→right */}
      <path
        className="continuous-underline"
        d="M0 5 Q 20 3, 40 6 T 80 4 Q 95 3, 100 5
           Q 95 7, 80 9 T 40 8 Q 20 10, 0 9
           Q 15 11, 35 14 T 70 12 Q 90 11, 100 13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default HandwrittenUnderline;
