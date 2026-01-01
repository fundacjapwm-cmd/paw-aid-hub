import React from "react";
import { cn } from "@/lib/utils";

interface HandwrittenHeartProps {
  className?: string;
}

const HandwrittenHeart = ({ className }: HandwrittenHeartProps) => {
  return (
    <svg
      viewBox="0 0 40 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <style>
        {`
          .heart-draw {
            stroke-dasharray: 150;
            stroke-dashoffset: 150;
            animation: drawHeart 1s ease-in-out forwards;
            animation-delay: 0.5s;
          }
          
          @keyframes drawHeart {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      {/* Irregular hand-drawn heart path - asymmetric and sketchy */}
      <path
        className="heart-draw"
        d="M20 32C20 32 3 22 2 13C1 6 6 2 12 3C15 3.5 18 6 20 9C22 5 26 2.5 29 3C35 4 39 8 38 14C37 23 20 32 20 32Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Extra sketchy line for hand-drawn effect */}
      <path
        className="heart-draw"
        d="M19 30C19 30 5 21 4 14C3.5 10 5 6 9 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
        style={{ animationDelay: '0.7s' }}
      />
    </svg>
  );
};

export default HandwrittenHeart;
