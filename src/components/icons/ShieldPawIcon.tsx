const ShieldPawIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shield shape */}
    <path
      d="M32 4L8 14V30C8 44 18 54 32 60C46 54 56 44 56 30V14L32 4Z"
      fill="currentColor"
      opacity="0.9"
    />
    {/* Paw inside shield */}
    <ellipse cx="32" cy="34" rx="7" ry="6" fill="white" opacity="0.85" />
    <circle cx="24" cy="24" r="4" fill="white" opacity="0.85" />
    <circle cx="40" cy="24" r="4" fill="white" opacity="0.85" />
    <circle cx="25" cy="44" r="3" fill="white" opacity="0.85" />
    <circle cx="39" cy="44" r="3" fill="white" opacity="0.85" />
  </svg>
);

export default ShieldPawIcon;
