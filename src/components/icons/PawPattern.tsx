import React from "react";
import { cn } from "@/lib/utils";
import pawPatternImage from "@/assets/paw-pattern.png";

interface PawPatternProps {
  className?: string;
  sparse?: boolean;
}

const PawPattern = ({ className, sparse = false }: PawPatternProps) => {
  if (sparse) {
    return (
      <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
        {/* Fewer paw prints for smaller pages */}
        <img 
          src={pawPatternImage} 
          alt="" 
          width={320}
          height={448}
          className="absolute top-[5%] right-[3%] w-48 md:w-64 lg:w-80 opacity-80"
        />
        <img 
          src={pawPatternImage} 
          alt="" 
          loading="lazy"
          width={288}
          height={403}
          className="absolute bottom-[10%] left-[2%] w-40 md:w-56 lg:w-72 opacity-70 rotate-[-15deg]"
        />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Paw prints scattered across the page - positioned to avoid overlap */}
      <img 
        src={pawPatternImage} 
        alt="" 
        width={224}
        height={314}
        fetchPriority="high"
        className="absolute top-[3%] right-[8%] w-32 md:w-48 lg:w-56 opacity-60"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        loading="lazy"
        width={192}
        height={269}
        className="absolute top-[30%] left-[3%] w-28 md:w-40 lg:w-48 opacity-50 -rotate-12"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        loading="lazy"
        width={208}
        height={291}
        className="absolute top-[55%] right-[5%] w-32 md:w-44 lg:w-52 opacity-55 rotate-6"
      />
      <img 
        src={pawPatternImage} 
        alt="" 
        loading="lazy"
        width={176}
        height={246}
        className="absolute top-[75%] left-[6%] w-24 md:w-36 lg:w-44 opacity-45 rotate-[-20deg]"
      />
    </div>
  );
};

export default PawPattern;
