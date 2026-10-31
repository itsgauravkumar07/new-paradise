import React from "react";

interface SectionHeaderProps {
  eyebrow?: React.ReactNode;       // small uppercase label above the title
  eyebrowIcon?: React.ReactNode;   // when set, the eyebrow renders as a blue chip with this icon
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;        // right side: arrows, "View all" link, toggle...
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

/** Section title block used by every home / listing section (design.md). */
export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  action,
  align = "left",
  className = "",
  titleClassName = "",
}: SectionHeaderProps) {
  const center = align === "center";
  return (
    <div
      className={`mb-8 flex flex-col gap-4 ${
        center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      } ${className}`}
    >
      <div className="max-w-2xl">
        {eyebrow &&
          (eyebrowIcon ? (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary [&_svg]:h-3.5 [&_svg]:w-3.5">
              {eyebrowIcon}
              {eyebrow}
            </span>
          ) : (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
          ))}
        <h2 className={`!text-[20px] font-extrabold text-heading md:text-4xl ${titleClassName}`}>{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default SectionHeader;