interface IconProps {
  className?: string;
}

export const ShelterHouseIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M24 6L4 20h6v18h28V20h6L24 6z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M18 38V28a6 6 0 0112 0v10" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="24" cy="22" r="2" fill="currentColor" />
  </svg>
);

export const CatSterileIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cat face */}
    <circle 
      cx="24" 
      cy="26" 
      r="14" 
      stroke="currentColor" 
      strokeWidth="2.5"
    />
    {/* Cat ears */}
    <path 
      d="M12 18L8 6l8 8M36 18l4-12-8 8" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Eyes */}
    <circle cx="19" cy="24" r="2" fill="currentColor" />
    <circle cx="29" cy="24" r="2" fill="currentColor" />
    {/* Nose */}
    <path 
      d="M24 28v2m-2 1c0 1 2 2 4 0" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    {/* Heart/medical symbol */}
    <path 
      d="M38 8l-4 4m4 0l-4-4" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const CharityHandIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Heart */}
    <path 
      d="M24 16c-2-4-6-5-9-3-4 3-4 8 0 12l9 10 9-10c4-4 4-9 0-12-3-2-7-1-9 3z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Hands */}
    <path 
      d="M8 28c2 2 6 4 10 4M40 28c-2 2-6 4-10 4" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <path 
      d="M6 24l4 6M42 24l-4 6" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
  </svg>
);

export const VaccineIcon = ({ className }: IconProps) => (
  <svg 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Syringe body */}
    <path 
      d="M10 38l6-6m22-22l-6 6" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <rect 
      x="14" 
      y="18" 
      width="20" 
      height="12" 
      rx="2"
      transform="rotate(-45 14 18)"
      stroke="currentColor" 
      strokeWidth="2.5"
    />
    {/* Plunger */}
    <path 
      d="M34 14l4-4M36 12l4-4" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    {/* Needle */}
    <path 
      d="M14 34l-4 4" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round"
    />
    {/* Marks */}
    <path 
      d="M20 22l2 2M24 18l2 2M28 14l2 2" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);
