// أيقونات خطية موحدة (سماكة 1.8 على شبكة 24).
type P = { className?: string };
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconSearch = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);
export const IconPlus = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconCheck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconClose = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconPhone = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 4h3l2 5-2.5 1.6a11 11 0 0 0 5.9 5.9L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const IconChat = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4A8.5 8.5 0 1 1 20 11.5z" />
    <path d="M9 10.5h6M9 13.5h4" />
  </svg>
);
export const IconCopy = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);
export const IconTrash = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);
export const IconMenu = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const IconArrow = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const IconList = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <rect x="3.5" y="4.5" width="3" height="3" rx=".6" />
    <rect x="3.5" y="10.5" width="3" height="3" rx=".6" />
    <rect x="3.5" y="16.5" width="3" height="3" rx=".6" />
  </svg>
);
export const IconGrid = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
  </svg>
);
export const IconPin = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </svg>
);
export const IconClock = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconChevron = ({ className, dir = "left" }: P & { dir?: "left" | "right" }) => (
  <svg {...base} className={className}>
    <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
  </svg>
);
export const IconRotate = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5" />
  </svg>
);
export const IconFloor = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M2.5 15.5L12 10l9.5 5.5L12 21z" />
    <path d="M7.25 12.75l9.5 5.5M16.75 12.75l-9.5 5.5" />
  </svg>
);
export const IconCube = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l8.5 4.75v8.5L12 21l-8.5-4.75v-8.5z" />
    <path d="M3.5 7.75L12 12.5l8.5-4.75M12 12.5V21" />
  </svg>
);
export const IconNet = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8.5 3h7v5.5H21v7h-5.5V21h-7v-5.5H3v-7h5.5z" />
    <path d="M8.5 8.5h7v7h-7z" />
  </svg>
);
export const IconSms = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.5 3v-3H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" />
    <path d="M7.5 10h9M7.5 13.5h6" />
  </svg>
);
