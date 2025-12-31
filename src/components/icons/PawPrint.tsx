import React from "react";
import { cn } from "@/lib/utils";

interface PawPrintProps {
  className?: string;
}

const PawPrint = ({ className }: PawPrintProps) => {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-12 h-12", className)}
    >
      {/* Main pad */}
      <ellipse cx="30" cy="38" rx="14" ry="12" />
      {/* Top pads */}
      <ellipse cx="18" cy="20" rx="7" ry="9" />
      <ellipse cx="42" cy="20" rx="7" ry="9" />
      {/* Side pads */}
      <ellipse cx="10" cy="32" rx="6" ry="8" transform="rotate(-15 10 32)" />
      <ellipse cx="50" cy="32" rx="6" ry="8" transform="rotate(15 50 32)" />
    </svg>
  );
};

export default PawPrint;
