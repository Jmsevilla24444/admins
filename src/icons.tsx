import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number; stroke?: string };
const S = (p: Partial<IconProps>) => ({ width: p.size ?? 20, height: p.size ?? 20, viewBox: '0 0 24 24', fill: 'none', stroke: p.stroke ?? 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const);

export const IconHome: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>
);
export const IconBuilding: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><rect x="4" y="3" width="8" height="18" rx="1"/><rect x="14" y="9" width="6" height="12" rx="1"/><path d="M7 7h2M7 11h2M7 15h2M16 13h2M16 17h2"/></svg>
);
export const IconCalendar: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 9h18"/></svg>
);
export const IconReport: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6M9 9h2"/></svg>
);
export const IconPlus: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M12 5v14M5 12h14"/></svg>
);
export const IconUpload: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M12 16V7"/><path d="M8.5 10.5 12 7l3.5 3.5"/><path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/></svg>
);
export const IconEdit: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M4 20h4l11-11a2.5 2.5 0 1 0-3.5-3.5L4.5 16.5V20z"/></svg>
);
export const IconTrash: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M4 7h16"/><path d="M9 7V4h6v3"/><rect x="6" y="7" width="12" height="13" rx="1"/><path d="M10 11v6M14 11v6"/></svg>
);
export const IconEye: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const IconCheck: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><path d="M20 6 9 17l-5-5"/></svg>
);
export const IconGlobe: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
);
export const IconMail: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
);
export const IconLock: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>
);
export const IconSearch: React.FC<IconProps> = (p) => (
  <svg {...S(p)} {...p}><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>
);
