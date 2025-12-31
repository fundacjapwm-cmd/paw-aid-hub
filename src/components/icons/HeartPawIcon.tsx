const HeartPawIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Heart shape */}
    <path
      d="M32 56C32 56 8 40 8 24C8 14 16 8 24 8C28 8 32 12 32 12C32 12 36 8 40 8C48 8 56 14 56 24C56 40 32 56 32 56Z"
      fill="currentColor"
      opacity="0.9"
    />
    {/* Paw pad in heart */}
    <ellipse cx="32" cy="32" rx="6" ry="5" fill="white" opacity="0.8" />
    <circle cx="24" cy="24" r="3" fill="white" opacity="0.8" />
    <circle cx="40" cy="24" r="3" fill="white" opacity="0.8" />
    <circle cx="26" cy="40" r="2.5" fill="white" opacity="0.8" />
    <circle cx="38" cy="40" r="2.5" fill="white" opacity="0.8" />
  </svg>
);

export default HeartPawIcon;
