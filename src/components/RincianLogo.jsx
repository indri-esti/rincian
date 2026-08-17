function RincianLogo({ size = 52 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Rincian"
      role="img"
    >
      <defs>
        <linearGradient
          id="rincianLogoGradient"
          x1="8"
          y1="5"
          x2="45"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#1677F0" />
          <stop offset="1" stopColor="#0759D8" />
        </linearGradient>

        <linearGradient
          id="rincianRGradient"
          x1="18"
          y1="13"
          x2="36"
          y2="39"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAF2FF" />
        </linearGradient>

        <filter
          id="rincianLogoShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Background */}
      <rect
        x="1"
        y="1"
        width="50"
        height="50"
        rx="15"
        fill="url(#rincianLogoGradient)"
        filter="url(#rincianLogoShadow)"
      />

      {/* Highlight */}
      <path
        d="M16 4H29C20.5 7.2 14 15.3 14 25.2V38C14 42.5 10.5 46 6 46H5V20C5 11.16 10.16 4 16 4Z"
        fill="white"
        fillOpacity="0.07"
      />

      {/* Modern R */}
      <path
        d="
          M17 39
          V13
          H28.2
          C34.2 13 38 16.1 38 21.2
          C38 25.2 35.7 28 31.9 29.1
          L38.8 39
          H32.4
          L26.3 30.1
          H22.7
          V39
          H17
          Z

          M22.7 18.1
          V25.1
          H27.7
          C30.7 25.1 32.2 23.8 32.2 21.6
          C32.2 19.3 30.7 18.1 27.7 18.1
          H22.7
          Z
        "
        fill="url(#rincianRGradient)"
      />

      {/* Folded accent */}
      <path
        d="
          M26.3 30.1
          L32.4 39
          H38.8
          L31.9 29.1
          C30.4 29.5 28.4 30 26.3 30.1Z
        "
        fill="#D7E7FF"
        fillOpacity="0.65"
      />
    </svg>
  );
}

export default RincianLogo;