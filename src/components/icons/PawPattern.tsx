import React from "react";
import { cn } from "@/lib/utils";
import pawPatternImage from "@/assets/paw-pattern.png";

interface PawPatternProps {
  className?: string;
}

const PawPattern = ({ className }: PawPatternProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Large paw prints scattered across the page - more visible */}
      <img 
        src={pawPatternImage} 
        alt="" 
        className="absolute top-[2%] right-[5%] w-72 md:w-96 lg:w-[500px] opacity-100"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        className="absolute top-[25%] left-[-5%] w-64 md:w-80 lg:w-96 opacity-90 -rotate-12"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        className="absolute top-[45%] right-[-8%] w-72 md:w-96 lg:w-[500px] opacity-95 rotate-6"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        className="absolute top-[65%] left-[2%] w-56 md:w-72 lg:w-80 opacity-85 rotate-[-20deg]"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        className="absolute top-[85%] right-[10%] w-64 md:w-80 lg:w-96 opacity-90 rotate-12"
      />
    </div>
  );
};

export default PawPattern;
