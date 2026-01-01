import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenHeartProps {
  className?: string;
}

const HandwrittenHeart = ({ className }: HandwrittenHeartProps) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <style>
        {`
          .heart-draw {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: drawHeart 1s ease-in-out forwards;
            animation-delay: 0.5s;
          }
          
          @keyframes drawHeart {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* Hand-drawn heart path */}
      <path
        className="heart-draw"
        d="M16 28C16 28 4 20 4 12C4 7 8 4 12 4C14 4 16 6 16 6C16 6 18 4 20 4C24 4 28 7 28 12C28 20 16 28 16 28Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default HandwrittenHeart;
