export default function BrandMark({ className = "brand-mark", size = 40 }) {
  const gradId = `smBrandGrad-${size}-${className.replace(/\s+/g, "-")}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="8"
          y1="4"
          x2="56"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0E2433" />
          <stop offset="0.55" stopColor="#157A8C" />
          <stop offset="1" stopColor="#1A9AA8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />
      <path
        fill="#FFFFFF"
        d="M18 34.5 32 22l14 12.5V46a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V34.5Z"
      />
      <path
        fill="#0E2433"
        opacity="0.18"
        d="M28 49h8v-9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v9Z"
      />
      <path
        fill="none"
        stroke="#F0A202"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 18c8-6 18-6 28 1"
      />
      <path
        fill="#F0A202"
        d="M40.2 14.4 48.5 19l-6.8 5.2 1.2-4.6 4.1-.8-6.8-4.4Z"
      />
    </svg>
  );
}
