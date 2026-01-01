import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenHeartProps {
  className?: string;
}

const HandwrittenHeart = ({ className }: HandwrittenHeartProps) => {
  return (
    <svg
      viewBox="0 0 56 48"
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
      {/* Asymmetric flowing heart with long swirl tail - like middle heart from reference */}
      <path
        className="heart-draw"
        d="M8 44C12 40 18 34 26 28C30 24 34 18 34 12C34 6 30 3 26 4C22 5 20 9 20 9C20 9 18 4 13 4C8 4 4 8 5 14C6 22 16 32 26 38C36 32 48 20 48 12C48 6 44 3 40 4C36 5 34 8 34 12"
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
