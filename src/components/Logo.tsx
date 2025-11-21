import React from "react";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <img 
      src="/logo.svg" 
      alt="Pączki w Maśle" 
      className={cn("h-auto w-auto", className)}
    />
  );
};
