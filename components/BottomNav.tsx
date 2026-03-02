"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  familyId: string;
}

const ICON_SIZE = 20;

const iconStyle: React.CSSProperties = {
  display: "inline-flex",
  width: ICON_SIZE,
  height: ICON_SIZE,
  flexShrink: 0,
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span style={iconStyle}>
      <svg
        width={ICON_SIZE}
        height={ICON_SIZE}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {children}
      </svg>
    </span>
  );
}

export default function BottomNav({ familyId }: Props) {
  const pathname = usePathname();
  const base = `/f/${familyId}`;

  const links = [
    {
      href: base,
      label: "マイタスク",
      icon: (
        <Icon>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </Icon>
      ),
    },
    {
      href: `${base}/events`,
      label: "イベント",
      icon: (
        <Icon>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </Icon>
      ),
    },
    {
      href: `${base}/calendar`,
      label: "カレンダー",
      icon: (
        <Icon>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </Icon>
      ),
    },
    {
      href: `${base}/settings`,
      label: "設定",
      icon: (
        <Icon>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </Icon>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/60 flex z-40" style={{ boxShadow: "0 -4px 24px 0 rgba(99,102,241,0.08)" }}>
      {links.map((link) => {
        const isActive =
          link.href === base ? pathname === base : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-all relative ${
              isActive ? "text-indigo-600" : "text-gray-400 hover:text-indigo-400"
            }`}
          >
            {isActive && (
              <span
                className="absolute top-0 left-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: 24, height: 2, transform: "translateX(-50%)" }}
              />
            )}
            {link.icon}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
