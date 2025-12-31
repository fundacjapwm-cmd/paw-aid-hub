const HandshakePawIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Human hand */}
    <path
      d="M12 32L24 20C26 18 30 18 32 20L36 24"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M8 36L20 28"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Paw */}
    <ellipse cx="44" cy="36" rx="8" ry="7" fill="currentColor" />
    <circle cx="36" cy="26" r="4" fill="currentColor" />
    <circle cx="52" cy="26" r="4" fill="currentColor" />
    <circle cx="38" cy="46" r="3.5" fill="currentColor" />
    <circle cx="50" cy="46" r="3.5" fill="currentColor" />
    {/* Connection spark */}
    <circle cx="34" cy="32" r="2" fill="white" opacity="0.9" />
  </svg>
);

export default HandshakePawIcon;
