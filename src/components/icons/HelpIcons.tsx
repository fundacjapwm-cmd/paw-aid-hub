import React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

// Ikona serca z łapką - pomoc z sercem
export const HeartPawHelpIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-16 h-16", className)}
  >
    {/* Serce */}
    <path
      d="M40 70 C 20 55, 8 40, 8 28 C 8 16, 18 8, 28 8 C 35 8, 38 12, 40 16 C 42 12, 45 8, 52 8 C 62 8, 72 16, 72 28 C 72 40, 60 55, 40 70 Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M40 70 C 20 55, 8 40, 8 28 C 8 16, 18 8, 28 8 C 35 8, 38 12, 40 16 C 42 12, 45 8, 52 8 C 62 8, 72 16, 72 28 C 72 40, 60 55, 40 70 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    {/* Łapka w środku */}
    <ellipse cx="40" cy="38" rx="6" ry="7" fill="currentColor" />
    <circle cx="32" cy="30" r="3" fill="currentColor" />
    <circle cx="48" cy="30" r="3" fill="currentColor" />
    <circle cx="35" cy="24" r="2.5" fill="currentColor" />
    <circle cx="45" cy="24" r="2.5" fill="currentColor" />
  </svg>
);

// Ikona paczki z kokardą - dostawy
export const GiftBoxIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-16 h-16", className)}
  >
    {/* Pudełko */}
    <rect x="12" y="32" width="56" height="40" rx="4" fill="currentColor" opacity="0.2" />
    <rect x="12" y="32" width="56" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Wieczko */}
    <rect x="8" y="22" width="64" height="14" rx="3" fill="currentColor" opacity="0.3" />
    <rect x="8" y="22" width="64" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Wstążka pionowa */}
    <line x1="40" y1="22" x2="40" y2="72" stroke="currentColor" strokeWidth="2.5" />
    {/* Kokarda */}
    <path d="M40 22 C 35 16, 28 14, 28 10 C 28 6, 34 6, 40 12 C 46 6, 52 6, 52 10 C 52 14, 45 16, 40 22" fill="currentColor" />
  </svg>
);

// Ikona stetoskopu - opieka weterynaryjna
export const VetCareIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-16 h-16", className)}
  >
    {/* Główna pętla stetoskopu */}
    <path
      d="M20 12 L 20 35 C 20 50, 35 60, 50 55 C 60 52, 65 42, 65 32"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <path
      d="M30 12 L 30 35 C 30 45, 38 50, 48 48"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    {/* Słuchawki */}
    <circle cx="20" cy="10" r="4" fill="currentColor" />
    <circle cx="30" cy="10" r="4" fill="currentColor" />
    {/* Membrana */}
    <circle cx="65" cy="32" r="12" fill="currentColor" opacity="0.2" />
    <circle cx="65" cy="32" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="65" cy="32" r="6" fill="currentColor" />
    {/* Serduszko małe */}
    <path
      d="M40 68 C 35 64, 30 60, 30 55 C 30 50, 35 48, 40 52 C 45 48, 50 50, 50 55 C 50 60, 45 64, 40 68"
      fill="currentColor"
    />
  </svg>
);

// Ikona domu z sercem - adopcje
export const AdoptionHomeIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-16 h-16", className)}
  >
    {/* Dach */}
    <path
      d="M40 8 L 8 35 L 16 35 L 16 70 L 64 70 L 64 35 L 72 35 Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M40 8 L 8 35 L 16 35 L 16 70 L 64 70 L 64 35 L 72 35 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Serce w środku */}
    <path
      d="M40 58 C 30 50, 24 44, 24 38 C 24 32, 30 28, 36 28 C 38 28, 39 29, 40 31 C 41 29, 42 28, 44 28 C 50 28, 56 32, 56 38 C 56 44, 50 50, 40 58"
      fill="currentColor"
    />
  </svg>
);

// Ikona rąk trzymających łapkę - współpraca
export const HandsPawIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-16 h-16", className)}
  >
    {/* Lewa dłoń */}
    <path
      d="M10 50 C 10 40, 20 35, 30 40 L 35 45"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Prawa dłoń */}
    <path
      d="M70 50 C 70 40, 60 35, 50 40 L 45 45"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Łapka na środku */}
    <ellipse cx="40" cy="45" rx="10" ry="12" fill="currentColor" opacity="0.3" />
    <ellipse cx="40" cy="45" rx="10" ry="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Poduszki łapki */}
    <ellipse cx="40" cy="48" rx="5" ry="6" fill="currentColor" />
    <circle cx="32" cy="38" r="4" fill="currentColor" />
    <circle cx="48" cy="38" r="4" fill="currentColor" />
    <circle cx="35" cy="30" r="3" fill="currentColor" />
    <circle cx="45" cy="30" r="3" fill="currentColor" />
    {/* Dolna część rąk */}
    <path
      d="M10 50 L 10 70"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M70 50 L 70 70"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
