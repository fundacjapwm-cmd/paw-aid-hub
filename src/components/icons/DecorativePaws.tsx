const DecorativePaws = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Paw 1 - top left */}
    <g opacity="0.08" transform="translate(20, 30) rotate(-15)">
      <ellipse cx="24" cy="28" rx="10" ry="8" fill="currentColor" />
      <circle cx="12" cy="14" r="6" fill="currentColor" />
      <circle cx="36" cy="14" r="6" fill="currentColor" />
      <circle cx="10" cy="42" r="5" fill="currentColor" />
      <circle cx="38" cy="42" r="5" fill="currentColor" />
    </g>

    {/* Paw 2 - top right */}
    <g opacity="0.06" transform="translate(320, 60) rotate(25)">
      <ellipse cx="20" cy="24" rx="8" ry="7" fill="currentColor" />
      <circle cx="10" cy="12" r="5" fill="currentColor" />
      <circle cx="30" cy="12" r="5" fill="currentColor" />
      <circle cx="8" cy="36" r="4" fill="currentColor" />
      <circle cx="32" cy="36" r="4" fill="currentColor" />
    </g>

    {/* Paw 3 - middle left */}
    <g opacity="0.05" transform="translate(60, 180) rotate(10)">
      <ellipse cx="16" cy="20" rx="7" ry="6" fill="currentColor" />
      <circle cx="8" cy="10" r="4" fill="currentColor" />
      <circle cx="24" cy="10" r="4" fill="currentColor" />
      <circle cx="6" cy="30" r="3.5" fill="currentColor" />
      <circle cx="26" cy="30" r="3.5" fill="currentColor" />
    </g>

    {/* Curvy arrow 1 */}
    <path
      d="M100 120 Q 140 100, 160 140 Q 180 180, 220 160"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      opacity="0.06"
      strokeLinecap="round"
    />
    <path
      d="M215 155 L 225 160 L 218 170"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      opacity="0.06"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Paw 4 - bottom right */}
    <g opacity="0.07" transform="translate(300, 280) rotate(-20)">
      <ellipse cx="22" cy="26" rx="9" ry="7" fill="currentColor" />
      <circle cx="11" cy="13" r="5.5" fill="currentColor" />
      <circle cx="33" cy="13" r="5.5" fill="currentColor" />
      <circle cx="9" cy="39" r="4.5" fill="currentColor" />
      <circle cx="35" cy="39" r="4.5" fill="currentColor" />
    </g>

    {/* Curvy arrow 2 */}
    <path
      d="M280 200 Q 260 240, 300 260 Q 340 280, 320 320"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.05"
      strokeLinecap="round"
    />
    <path
      d="M315 315 L 320 325 L 328 318"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      opacity="0.05"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Paw 5 - bottom left */}
    <g opacity="0.06" transform="translate(80, 320) rotate(30)">
      <ellipse cx="18" cy="22" rx="8" ry="6" fill="currentColor" />
      <circle cx="9" cy="11" r="4.5" fill="currentColor" />
      <circle cx="27" cy="11" r="4.5" fill="currentColor" />
      <circle cx="7" cy="33" r="4" fill="currentColor" />
      <circle cx="29" cy="33" r="4" fill="currentColor" />
    </g>

    {/* Curvy arrow 3 - playful */}
    <path
      d="M180 300 Q 200 280, 180 260 Q 160 240, 180 220"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.04"
      strokeLinecap="round"
    />

    {/* Small paw 6 */}
    <g opacity="0.04" transform="translate(200, 80) rotate(-5)">
      <ellipse cx="12" cy="15" rx="5" ry="4" fill="currentColor" />
      <circle cx="6" cy="8" r="3" fill="currentColor" />
      <circle cx="18" cy="8" r="3" fill="currentColor" />
      <circle cx="5" cy="22" r="2.5" fill="currentColor" />
      <circle cx="19" cy="22" r="2.5" fill="currentColor" />
    </g>
  </svg>
);

export default DecorativePaws;
