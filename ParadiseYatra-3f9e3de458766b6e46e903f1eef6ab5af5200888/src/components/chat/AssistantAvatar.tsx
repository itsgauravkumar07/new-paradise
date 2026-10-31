import { useId } from "react";
import { ASSISTANT } from "@/lib/chat/persona";

/** Illustrated portrait of the chat assistant (inline SVG: no image download). */
export default function AssistantAvatar({ className = "h-10 w-10" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0 rounded-full`} role="img" aria-label={ASSISTANT.name}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="64" height="64" fill={`url(#bg-${id})`} />
        {/* hair, behind the head */}
        <path d="M14 34c0-13 8-22 18-22s18 9 18 22v22H14z" fill="#2b1a12" />
        {/* top */}
        <path d="M10 64c1-10 9-16 22-16s21 6 22 16z" fill="#2563eb" />
        <path d="M26 49l6 7 6-7" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" />
        {/* neck */}
        <path d="M27 42h10v8c-3 2-7 2-10 0z" fill="#e0a77f" />
        {/* face */}
        <ellipse cx="32" cy="31" rx="11" ry="13" fill="#f1bf98" />
        {/* fringe and side-swept hair */}
        <path d="M20 30c0-9 6-15 13-15 7 0 12 5 12 12-4-1-9-4-12-8-2 5-7 9-13 11z" fill="#2b1a12" />
        {/* earrings */}
        <circle cx="21" cy="35" r="1.4" fill="#f59e0b" />
        <circle cx="43" cy="35" r="1.4" fill="#f59e0b" />
        {/* eyes, brows, smile, cheeks */}
        <ellipse cx="27.5" cy="31.5" rx="1.4" ry="1.8" fill="#2b1a12" />
        <ellipse cx="36.5" cy="31.5" rx="1.4" ry="1.8" fill="#2b1a12" />
        <path d="M25 28c1.5-1 3.5-1 5 0M34 28c1.5-1 3.5-1 5 0" fill="none" stroke="#2b1a12" strokeWidth="1" strokeLinecap="round" />
        <path d="M28.5 37c2 1.8 5 1.8 7 0" fill="none" stroke="#b5533c" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="25" cy="35.5" r="1.8" fill="#f28c8c" opacity="0.35" />
        <circle cx="39" cy="35.5" r="1.8" fill="#f28c8c" opacity="0.35" />
        {/* bindi */}
        <circle cx="32" cy="27.3" r="0.9" fill="#dc2626" />
      </g>
    </svg>
  );
}
