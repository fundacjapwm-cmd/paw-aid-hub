import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenHeartProps {
  className?: string;
}

const HandwrittenHeart = ({ className }: HandwrittenHeartProps) => {
  return (
    <svg
      viewBox="0 0 48 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <style>
        {`
          .heart-draw {
            stroke-dasharray: 200;
            stroke-dashoffset: 200;
            animation: drawHeart 1.2s ease-in-out forwards;
            animation-delay: 0.5s;
          }
          
          @keyframes drawHeart {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* Single continuous flowing heart with swirl tail */}
      <path
        className="heart-draw"
        d="M24 38C24 38 6 26 4 16C2 8 8 3 14 4C18 4.5 22 8 24 12C26 7 31 3 36 4C42 5 46 10 44 18C42 28 24 38 24 38C24 38 20 42 14 40"
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
