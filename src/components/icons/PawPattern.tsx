import React from "react";
import { cn } from "@/lib/utils";

interface PawPatternProps {
  className?: string;
}

const PawPattern = ({ className }: PawPatternProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Scattered paw prints */}
      <svg className="absolute top-[5%] left-[8%] w-12 h-12 text-primary/5 rotate-[-15deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[15%] right-[12%] w-16 h-16 text-primary/4 rotate-[25deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[35%] left-[3%] w-10 h-10 text-primary/3 rotate-[45deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[45%] right-[5%] w-14 h-14 text-primary/5 rotate-[-30deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[60%] left-[15%] w-8 h-8 text-primary/4 rotate-[10deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[70%] right-[18%] w-12 h-12 text-primary/3 rotate-[-45deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[85%] left-[6%] w-14 h-14 text-primary/5 rotate-[60deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
      
      <svg className="absolute top-[92%] right-[8%] w-10 h-10 text-primary/4 rotate-[-20deg]" viewBox="0 0 40 40" fill="currentColor">
        <ellipse cx="20" cy="24" rx="8" ry="10" />
        <circle cx="10" cy="12" r="5" />
        <circle cx="30" cy="12" r="5" />
        <circle cx="14" cy="4" r="4" />
        <circle cx="26" cy="4" r="4" />
      </svg>
    </div>
  );
};

export default PawPattern;
