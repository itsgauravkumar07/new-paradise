// Renders the content blocks of a legal page section. No hooks, so it works on the server (public
// pages) and in the admin editor's live preview alike.
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { legalIcon } from "@/lib/legal/icons";
import type { LegalBlock, LegalTone } from "@/lib/legal/types";

export const legalLinkClass = "font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

// Only site paths, web pages, email and phone links are allowed (no javascript: and the like)
const safeHref = (href: string) => (/^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(href) ? href : null);

/** Text with **bold**, *italic* and [link](href). Anything else is shown as plain text. */
export function InlineText({ text }: { text: string }) {
  const parts = (text || "").split(TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-bold text-heading">{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const href = safeHref(link[2]);
          if (!href) return <Fragment key={i}>{link[1]}</Fragment>;
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={legalLinkClass}>{link[1]}</Link>
          ) : (
            <a key={i} href={href} className={legalLinkClass} {...(/^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link[1]}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

const NOTE_TONES: Record<LegalTone, string> = {
  info: "border-blue-100 bg-blue-50/70 text-blue-900 [&>svg]:text-blue-600",
  warning: "border-amber-200/70 bg-amber-50 text-amber-950 [&>svg]:text-amber-600",
  success: "border-emerald-200/70 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600",
};

const feeColor = (percent: number) => (percent <= 25 ? ["#f59e0b", "bg-amber-50 text-amber-700"] : percent <= 50 ? ["#f97316", "bg-orange-50 text-orange-700"] : ["#ef4444", "bg-red-50 text-red-700"]);

const IconTile = ({ name, className = "h-10 w-10 rounded-xl" }: { name: string; className?: string }) => {
  const Icon = legalIcon(name);
  return (
    <span className={`flex shrink-0 items-center justify-center bg-white text-primary shadow-sm ring-1 ring-slate-200/70 ${className}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
};

function Block({ block }: { block: LegalBlock }): ReactNode {
  switch (block.type) {
    case "paragraph":
      return <p><InlineText text={block.text} /></p>;

    case "heading":
      return <h3 className="pt-1 text-base font-bold text-heading">{block.text}</h3>;

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );

    case "note": {
      const Icon = legalIcon(block.icon);
      return (
        <div className={`flex gap-3 rounded-2xl border px-4 py-3.5 ${NOTE_TONES[block.tone] || NOTE_TONES.info}`}>
          <Icon className="mt-1 h-[18px] w-[18px] shrink-0" />
          <div className="text-[15px] leading-7"><InlineText text={block.text} /></div>
        </div>
      );
    }

    case "cards":
      return (
        <ul className={`grid gap-3 ${block.columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {block.items.map((card, i) => (
            <li key={i} className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:flex-row sm:gap-3.5">
              <IconTile name={card.icon} />
              <div className="min-w-0 text-[15px] leading-7">
                {card.title && <h3 className="mb-1 text-base font-bold leading-snug text-heading">{card.title}</h3>}
                <p><InlineText text={card.text} /></p>
              </div>
            </li>
          ))}
        </ul>
      );

    case "chips":
      return (
        <ul className="flex flex-wrap gap-2">
          {block.items.map((chip, i) => {
            const Icon = legalIcon(chip.icon);
            return (
              <li key={i} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-heading shadow-sm">
                <Icon className="h-3.5 w-3.5 text-primary" /> {chip.label}
              </li>
            );
          })}
        </ul>
      );

    case "fees":
      return (
        <ul className={`grid gap-3 ${block.items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {block.items.map((fee, i) => {
            const percent = Math.min(100, Math.max(0, Number(fee.percent) || 0));
            const [color, tone] = feeColor(percent);
            return (
              <li key={i} className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, #e2e8f0 0deg)` }}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-extrabold text-heading">{percent}%</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tone}`}>Cancellation fee</span>
                </div>
                <p className="mt-3 text-[15px] leading-6">
                  <strong className="font-bold text-heading">{fee.label}:</strong> <InlineText text={fee.text} />
                </p>
              </li>
            );
          })}
        </ul>
      );

    case "steps":
      return (
        <ol className="relative space-y-4 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-gradient-to-b before:from-primary/40 before:to-primary/10">
          {block.items.map((step, i) => {
            const Icon = legalIcon(step.icon);
            return (
              <li key={i} className="relative flex items-start gap-4">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-primary/20">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <p className="pt-1.5"><InlineText text={step.text} /></p>
              </li>
            );
          })}
        </ol>
      );

    case "choices":
      return (
        <ul className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {block.items.map((choice, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden="true" className="flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white shadow-md shadow-primary/25">OR</span>
                </li>
              )}
              <li className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <IconTile name={choice.icon} />
                <span className="font-semibold text-heading"><InlineText text={choice.text} /></span>
              </li>
            </Fragment>
          ))}
        </ul>
      );

    case "contact":
      return (
        <address className="not-italic">
          <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:grid-cols-2 sm:p-5">
            <div className="flex items-center gap-3 sm:col-span-2">
              <IconTile name="UserRound" className="h-11 w-11 rounded-xl" />
              <div className="leading-snug">
                <div className="font-bold text-heading">{block.title}</div>
                {block.subtitle && <div className="text-sm">{block.subtitle}</div>}
              </div>
            </div>
            {block.lines.map((line, i) => {
              const Icon = legalIcon(line.icon);
              return (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span><InlineText text={line.text} /></span>
                </div>
              );
            })}
          </div>
        </address>
      );

    default:
      return null;
  }
}

export default function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  );
}
