import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenHeartProps {
  className?: string;
}

const HandwrittenHeart = ({ className }: HandwrittenHeartProps) => {
  return (
    <svg
      viewBox="0 0 50 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <style>
        {`
          .heart-draw {
            stroke-dasharray: 250;
            stroke-dashoffset: 250;
            animation: drawHeart 1.4s ease-in-out forwards;
            animation-delay: 0.5s;
          }
          
          @keyframes drawHeart {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* Simple asymmetric heart with small swirl tail */}
      <path
        className="heart-draw"
        d="M24 36C24 36 6 24 5 14C4 8 9 4 14 5C18 6 21 10 24 14C27 9 32 5 37 6C42 7 46 12 44 18C42 26 24 36 24 36C22 38 18 40 14 38"
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
