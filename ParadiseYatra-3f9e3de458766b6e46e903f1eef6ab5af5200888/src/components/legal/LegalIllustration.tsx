// Hand-drawn hero scenes for the legal pages: each mixes the page's subject (shield, cookie, contract,
// refund) with travel details (flight path, plane, map pin). Decorative only, so hidden from screen readers.

import type { LegalKind } from "@/lib/legal/types";

export type { LegalKind };

const PLANE = "M22 0C22-2 20-3 17-3H6L-4-17H-9L-3-3H-14L-19-9H-22L-19 0-22 9H-19L-14 3H-3L-9 17H-4L6 3H17C20 3 22 2 22 0Z";
const STAR = "M0-9 2.2-2.2 9 0 2.2 2.2 0 9-2.2 2.2-9 0-2.2-2.2Z";
const PIN = "M0-26C-12-26-20-17-20-6-20 8 0 26 0 26S20 8 20-6C20-17 12-26 0-26Z";
const CLOUD = "M0 0H44A11 11 0 0 0 38-20 15 15 0 0 0 10-24 11 11 0 0 0 0 0Z";

function Backdrop({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-blob`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.35" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#1e3a8a" floodOpacity="0.14" />
        </filter>
      </defs>
      <circle cx="250" cy="210" r="168" fill={`url(#${id}-blob)`} />
      <circle cx="250" cy="210" r="190" fill="none" stroke="#bfdbfe" strokeWidth="1.5" strokeDasharray="3 10" />
    </>
  );
}

const Plane = ({ x, y, rotate, color = "#2563eb" }: { x: number; y: number; rotate: number; color?: string }) => (
  <path d={PLANE} fill={color} transform={`translate(${x} ${y}) rotate(${rotate})`} />
);

const Star = ({ x, y, scale = 1, color = "#f59e0b" }: { x: number; y: number; scale?: number; color?: string }) => (
  <path d={STAR} fill={color} transform={`translate(${x} ${y}) scale(${scale})`} />
);

const Pin = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d={PIN} fill="#f97316" />
    <circle cy="-6" r="7" fill="#fff" />
  </g>
);

const Cloud = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <path d={CLOUD} fill="#fff" stroke="#dbeafe" strokeWidth="2" transform={`translate(${x} ${y}) scale(${scale})`} />
);

const FlightPath = ({ d }: { d: string }) => (
  <path d={d} fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 9" />
);

function Privacy() {
  const id = "legal-privacy";
  return (
    <>
      <Backdrop id={id} />
      <defs>
        <linearGradient id={`${id}-shield`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <FlightPath d="M140 52C200 18 290 18 352 58" />
      <Plane x={360} y={64} rotate={34} />
      <Cloud x={34} y={300} scale={0.9} />
      <Pin x={428} y={150} scale={0.9} />

      {/* Passport behind the shield */}
      <g transform="rotate(-11 175 215)" filter={`url(#${id}-shadow)`}>
        <rect x="104" y="122" width="134" height="182" rx="14" fill="#1e3a8a" />
        <circle cx="171" cy="198" r="30" fill="none" stroke="#fbbf24" strokeWidth="3" />
        <ellipse cx="171" cy="198" rx="12" ry="30" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M141 198H201" stroke="#fbbf24" strokeWidth="2.5" />
        <rect x="141" y="250" width="60" height="6" rx="3" fill="#fbbf24" opacity="0.85" />
        <rect x="151" y="264" width="40" height="5" rx="2.5" fill="#fbbf24" opacity="0.5" />
      </g>

      {/* Shield and padlock */}
      <ellipse cx="266" cy="346" rx="74" ry="10" fill="#1e3a8a" opacity="0.1" />
      <g filter={`url(#${id}-shadow)`}>
        <path d="M266 92 348 124V204C348 262 314 302 266 324 218 302 184 262 184 204V124Z" fill={`url(#${id}-shield)`} />
      </g>
      <path d="M266 110 332 136V204C332 252 304 286 266 305 228 286 200 252 200 204V136Z" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      <path d="M244 206V189C244 176 254 166 266 166S288 176 288 189V206" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <rect x="233" y="200" width="66" height="56" rx="12" fill="#fff" />
      <circle cx="266" cy="223" r="7" fill="#1d4ed8" />
      <rect x="263" y="225" width="6" height="17" rx="3" fill="#1d4ed8" />

      {/* Key badge */}
      <g transform="translate(112 92)" filter={`url(#${id}-shadow)`}>
        <circle r="27" fill="#fff" />
        <circle cx="-7" cy="0" r="8" fill="none" stroke="#2563eb" strokeWidth="4" />
        <path d="M1 0H15M10 0V7M15 0V5" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Verified traveller card */}
      <g transform="translate(326 236)" filter={`url(#${id}-shadow)`}>
        <rect width="124" height="72" rx="16" fill="#fff" />
        <circle cx="28" cy="36" r="15" fill="#dbeafe" />
        <circle cx="28" cy="32" r="5.5" fill="#2563eb" />
        <path d="M18 45C19 39 23 37 28 37S37 39 38 45" fill="#2563eb" />
        <rect x="52" y="25" width="56" height="7" rx="3.5" fill="#cbd5e1" />
        <rect x="52" y="39" width="38" height="7" rx="3.5" fill="#e2e8f0" />
        <circle cx="116" cy="6" r="13" fill="#10b981" />
        <path d="M110 6 114 10 122 2" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <Star x={62} y={200} scale={0.8} />
      <Star x={444} y={338} scale={1} color="#60a5fa" />
      <Star x={402} y={98} scale={0.6} color="#60a5fa" />
    </>
  );
}

function Cookie() {
  const id = "legal-cookie";
  const toggles = [true, true, false];
  return (
    <>
      <Backdrop id={id} />
      <defs>
        <radialGradient id={`${id}-dough`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <mask id={`${id}-bite`}>
          <rect width="480" height="400" fill="#fff" />
          <circle cx="394" cy="208" r="22" fill="#000" />
          <circle cx="371" cy="196" r="16" fill="#000" />
          <circle cx="405" cy="232" r="16" fill="#000" />
        </mask>
      </defs>
      <FlightPath d="M36 150C46 92 100 54 162 50" />
      <Plane x={170} y={50} rotate={4} />
      <Pin x={74} y={318} scale={0.85} />

      {/* Browser window with cookie switches */}
      <g transform="rotate(-6 210 190)" filter={`url(#${id}-shadow)`}>
        <rect x="92" y="104" width="236" height="174" rx="16" fill="#fff" />
        <path d="M92 120A16 16 0 0 1 108 104H312A16 16 0 0 1 328 120V136H92Z" fill="#eff6ff" />
        <circle cx="112" cy="120" r="4.5" fill="#f87171" />
        <circle cx="127" cy="120" r="4.5" fill="#fbbf24" />
        <circle cx="142" cy="120" r="4.5" fill="#34d399" />
        <rect x="158" y="113" width="152" height="14" rx="7" fill="#fff" />
        {toggles.map((on, i) => {
          const y = 154 + i * 38;
          return (
            <g key={y}>
              <rect x="112" y={y} width="96" height="8" rx="4" fill="#cbd5e1" />
              <rect x="112" y={y + 14} width="62" height="6" rx="3" fill="#e2e8f0" />
              <rect x="264" y={y - 2} width="42" height="23" rx="11.5" fill={on ? "#2563eb" : "#cbd5e1"} />
              <circle cx={on ? 294 : 276} cy={y + 9.5} r="8" fill="#fff" />
            </g>
          );
        })}
      </g>

      {/* Analytics card */}
      <g transform="translate(346 72)" filter={`url(#${id}-shadow)`}>
        <rect width="100" height="72" rx="14" fill="#fff" />
        <rect x="18" y="38" width="11" height="20" rx="3" fill="#bfdbfe" />
        <rect x="36" y="26" width="11" height="32" rx="3" fill="#93c5fd" />
        <rect x="54" y="32" width="11" height="26" rx="3" fill="#bfdbfe" />
        <rect x="72" y="16" width="11" height="42" rx="3" fill="#2563eb" />
      </g>

      {/* Cookie with a bite taken out */}
      <ellipse cx="332" cy="352" rx="62" ry="9" fill="#78350f" opacity="0.12" />
      <g mask={`url(#${id}-bite)`}>
        <circle cx="330" cy="270" r="72" fill={`url(#${id}-dough)`} />
        <circle cx="330" cy="270" r="72" fill="none" stroke="#b45309" strokeOpacity="0.45" strokeWidth="3" />
        <circle cx="330" cy="270" r="58" fill="none" stroke="#fde68a" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 8" />
      </g>
      {[
        [298, 240, 9, 7, 20],
        [334, 222, 7, 6, -15],
        [362, 254, 9, 7, 40],
        [300, 292, 8, 6, -30],
        [336, 300, 10, 7, 10],
        [370, 302, 7, 6, 60],
        [276, 266, 6, 5, 0],
        [330, 262, 6, 5, 30],
      ].map(([cx, cy, rx, ry, r]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#78350f" transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
      <circle cx="418" cy="186" r="4" fill="#f59e0b" />
      <circle cx="428" cy="204" r="3" fill="#d97706" />
      <circle cx="412" cy="170" r="2.5" fill="#f59e0b" />

      <Star x={452} y={276} scale={0.8} color="#60a5fa" />
      <Star x={58} y={226} scale={0.7} />
      <Star x={232} y={360} scale={0.6} color="#60a5fa" />
    </>
  );
}

function Terms() {
  const id = "legal-terms";
  return (
    <>
      <Backdrop id={id} />
      <FlightPath d="M40 176C46 116 84 70 136 52" />
      <Plane x={144} y={49} rotate={-18} />
      <Cloud x={378} y={342} scale={0.9} />
      <Pin x={424} y={226} scale={0.85} />

      {/* Clipboard with a signed agreement */}
      <ellipse cx="240" cy="346" rx="96" ry="10" fill="#1e3a8a" opacity="0.1" />
      <g filter={`url(#${id}-shadow)`}>
        <rect x="150" y="88" width="180" height="240" rx="18" fill="#1e3a8a" />
      </g>
      <rect x="164" y="110" width="152" height="204" rx="10" fill="#fff" />
      <rect x="205" y="76" width="70" height="28" rx="10" fill="#93c5fd" />
      <circle cx="240" cy="86" r="5" fill="#1e3a8a" />
      <rect x="182" y="130" width="92" height="10" rx="5" fill="#1e3a8a" />
      {[0, 1, 2, 3].map((i) => {
        const y = 160 + i * 32;
        const done = i < 3;
        return (
          <g key={y}>
            <circle cx="191" cy={y + 6} r="9" fill={done ? "#10b981" : "#e2e8f0"} />
            {done && <path d={`M186 ${y + 6}l3.5 3.5 6.5-7`} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="208" y={y} width="88" height="7" rx="3.5" fill="#cbd5e1" />
            <rect x="208" y={y + 12} width="58" height="6" rx="3" fill="#e2e8f0" />
          </g>
        );
      })}
      <path d="M182 298C190 284 198 284 202 296S216 304 222 290 234 284 240 294" fill="none" stroke="#2563eb" strokeWidth="2.6" strokeLinecap="round" />

      {/* Pen */}
      <g transform="translate(346 236) rotate(32)" filter={`url(#${id}-shadow)`}>
        <rect x="-8" y="-74" width="16" height="94" rx="5" fill="#f97316" />
        <rect x="-8" y="-52" width="16" height="7" fill="#c2410c" />
        <path d="M-8 20H8L0 38Z" fill="#fde68a" />
        <path d="M-2.5 31H2.5L0 38Z" fill="#0f172a" />
      </g>

      {/* Scales of justice */}
      <g transform="translate(116 250)" filter={`url(#${id}-shadow)`}>
        <circle r="38" fill="#fff" />
        <path d="M0-21V17M-21-12H21M-9 19H9" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
        <circle cy="-22" r="3.5" fill="#2563eb" />
        <path d="M-21-12-29 5M-21-12-13 5M21-12 13 5M21-12 29 5" stroke="#93c5fd" strokeWidth="2" />
        <path d="M-30 5H-12A9 9 0 0 1-30 5ZM12 5H30A9 9 0 0 1 12 5Z" fill="#2563eb" />
      </g>

      {/* Seal */}
      <g transform="translate(350 124)" filter={`url(#${id}-shadow)`}>
        <circle r="29" fill="#fef3c7" />
        <circle r="22" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 4" />
        <path d={STAR} fill="#f59e0b" transform="scale(1.3)" />
      </g>

      <Star x={70} y={334} scale={0.8} color="#60a5fa" />
      <Star x={440} y={160} scale={0.7} />
      <Star x={300} y={36} scale={0.6} color="#60a5fa" />
    </>
  );
}

function Refund() {
  const id = "legal-refund";
  return (
    <>
      <Backdrop id={id} />
      <defs>
        <linearGradient id={`${id}-wallet`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
          <path d="M0 0 10 5 0 10Z" fill="#2563eb" />
        </marker>
      </defs>
      <FlightPath d="M372 366C418 356 448 324 456 288" />
      <Plane x={457} y={279} rotate={-82} />
      <Pin x={438} y={58} scale={0.75} />

      {/* Calendar */}
      <g transform="translate(46 50)" filter={`url(#${id}-shadow)`}>
        <rect width="70" height="64" rx="12" fill="#fff" />
        <path d="M0 12A12 12 0 0 1 12 0H58A12 12 0 0 1 70 12V20H0Z" fill="#2563eb" />
        <rect x="16" y="-5" width="5" height="12" rx="2.5" fill="#1e3a8a" />
        <rect x="49" y="-5" width="5" height="12" rx="2.5" fill="#1e3a8a" />
        {[0, 1, 2].flatMap((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect key={`${r}-${c}`} x={12 + c * 13} y={28 + r * 11} width="7" height="6" rx="1.5" fill={r === 2 && c === 2 ? "#10b981" : "#e2e8f0"} />
          ))
        )}
      </g>

      {/* Boarding pass */}
      <g transform="rotate(-8 200 160)" filter={`url(#${id}-shadow)`}>
        <rect x="95" y="110" width="212" height="100" rx="14" fill="#fff" />
        <path d="M240 122V198" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 5" />
        <path d={PLANE} fill="#2563eb" transform="translate(132 138) scale(0.7)" />
        <rect x="118" y="160" width="58" height="9" rx="4.5" fill="#1e3a8a" />
        <rect x="118" y="176" width="88" height="6" rx="3" fill="#cbd5e1" />
        <rect x="118" y="188" width="64" height="6" rx="3" fill="#e2e8f0" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={254 + i * 5.5} y="134" width={i % 3 === 0 ? 3.5 : 2} height="52" fill="#334155" />
        ))}
      </g>

      {/* Wallet with a card */}
      <ellipse cx="252" cy="346" rx="98" ry="10" fill="#1e3a8a" opacity="0.1" />
      <rect x="172" y="180" width="124" height="46" rx="9" fill="#34d399" transform="rotate(-6 234 203)" />
      <rect x="184" y="190" width="40" height="6" rx="3" fill="#fff" opacity="0.8" transform="rotate(-6 234 203)" />
      <g filter={`url(#${id}-shadow)`}>
        <rect x="150" y="204" width="204" height="130" rx="22" fill={`url(#${id}-wallet)`} />
      </g>
      <path d="M172 228H330" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 6" />
      <rect x="284" y="244" width="84" height="54" rx="15" fill="#1e3a8a" />
      <circle cx="310" cy="271" r="8.5" fill="#fbbf24" />

      {/* Refund coin */}
      <g transform="translate(364 132)">
        <circle r="46" fill="#fff" filter={`url(#${id}-shadow)`} />
        <circle r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
        <text y="9" textAnchor="middle" fontSize="26" fontWeight="800" fill="#92400e" fontFamily="system-ui, sans-serif">
          ₹
        </text>
        <path d="M-35 4A35 35 0 0 1 22-27" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" markerEnd={`url(#${id}-arrow)`} />
        <path d="M35-4A35 35 0 0 1-22 27" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" markerEnd={`url(#${id}-arrow)`} />
      </g>

      {/* Coins */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="104" cy={334 - i * 12} rx="30" ry="10" fill={i === 2 ? "#fbbf24" : "#f59e0b"} stroke="#d97706" strokeWidth="2" />
      ))}

      <Star x={250} y={62} scale={0.8} />
      <Star x={446} y={208} scale={0.7} color="#60a5fa" />
      <Star x={52} y={234} scale={0.8} color="#60a5fa" />
    </>
  );
}

const SCENES: Record<LegalKind, () => React.JSX.Element> = { privacy: Privacy, terms: Terms, cookie: Cookie, refund: Refund };

export default function LegalIllustration({ kind, className }: { kind: LegalKind; className?: string }) {
  const Scene = SCENES[kind];
  return (
    <svg viewBox="0 0 480 400" className={className} aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
}
