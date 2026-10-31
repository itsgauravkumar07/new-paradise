"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  /** Packages this option would show, given the other groups' selections. */
  count: number;
}

export interface FilterGroup {
  key: string;
  title: string;
  options: FilterOption[];
}

export type FilterSelection = Record<string, string[]>;

interface PackageFiltersProps {
  groups: FilterGroup[];
  selected: FilterSelection;
  onToggle: (group: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

const VISIBLE_OPTIONS = 6;

function Group({ group, selected, onToggle }: { group: FilterGroup; selected: string[]; onToggle: (value: string) => void }) {
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const options = showAll ? group.options : group.options.slice(0, VISIBLE_OPTIONS);

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between text-left text-sm font-bold text-heading"
      >
        {group.title}
        {selected.length > 0 && (
          <span className="ml-2 mr-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{selected.length}</span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="mt-3 flex flex-col gap-0.5">
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            const empty = opt.count === 0 && !active;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  disabled={empty}
                  onClick={() => onToggle(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                    empty
                      ? "cursor-not-allowed text-slate-300"
                      : active
                        ? "cursor-pointer bg-primary-light font-semibold text-primary"
                        : "cursor-pointer text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      active ? "border-primary bg-primary text-white" : empty ? "border-slate-200" : "border-slate-300 bg-white"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 truncate">{opt.label}</span>
                  <span className="text-xs text-slate-400">{opt.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && group.options.length > VISIBLE_OPTIONS && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 cursor-pointer px-2.5 text-xs font-bold text-primary hover:underline"
        >
          {showAll ? "Show less" : `Show all ${group.options.length}`}
        </button>
      )}
    </div>
  );
}

/** Multi-select filter panel: options within a group are OR-ed, groups are AND-ed. */
export default function PackageFilters({ groups, selected, onToggle, onClear, className = "" }: PackageFiltersProps) {
  const activeCount = Object.values(selected).reduce((n, v) => n + v.length, 0);
  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-base font-extrabold text-heading">Filters</h3>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="cursor-pointer text-xs font-bold text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>
      {groups
        .filter((g) => g.options.length > 0)
        .map((g) => (
          <Group key={g.key} group={g} selected={selected[g.key] ?? []} onToggle={(v) => onToggle(g.key, v)} />
        ))}
    </div>
  );
}
