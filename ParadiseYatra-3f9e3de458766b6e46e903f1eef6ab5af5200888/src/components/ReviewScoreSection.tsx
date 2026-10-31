import { Star } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Ratings block (design.md "Scores from people who actually travelled").
 *
 * IMPORTANT: put only REAL, verifiable numbers here. The section stays hidden
 * until REVIEW_SUMMARY is filled in, so fake ratings never reach the live site.
 *
 * Example:
 *   const REVIEW_SUMMARY = {
 *     overall: 4.8,
 *     caption: "Overall guest rating from verified guests.",
 *     sources: [
 *       { name: "Google Reviews", note: "Verified guests", score: 4.9, basis: "Based on 1,850 ratings" },
 *     ],
 *   } as ReviewSummary | null;
 */
interface ReviewSource {
  name: string;
  note: string;
  score: number;
  basis: string;
}
interface ReviewSummary {
  overall: number;
  caption: string;
  sources: ReviewSource[];
}

const REVIEW_SUMMARY = null as ReviewSummary | null;

const Stars = ({ score, className = "" }: { score: number; className?: string }) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${score} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-4 w-4 ${i <= Math.round(score) ? "fill-tertiary text-tertiary" : "text-slate-300"}`} />
    ))}
  </span>
);

const ReviewScoreSection = () => {
  if (!REVIEW_SUMMARY) return null;
  const { overall, caption, sources } = REVIEW_SUMMARY;

  return (
    <section className="bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <SectionHeader
        titleClassName="!text-[20px] sm:!text-3xl md:!text-3xl"
        eyebrow="What people say"
        title="Scores from people who actually travelled"
      />
        <div className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col justify-center gap-2 bg-primary p-8 text-white">
            <p className="text-5xl font-extrabold">
              {overall.toFixed(1)} <span className="text-xl font-semibold text-white/70">/ 5</span>
            </p>
            <Stars score={overall} />
            <p className="mt-2 text-sm text-white/85">{caption}</p>
          </div>
          <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {sources.map((s) => (
              <div key={s.name} className="flex flex-col justify-center gap-2 p-6">
                <div>
                  <p className="font-bold text-heading">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
                <p className="flex items-center gap-2 text-3xl font-extrabold text-heading">
                  {s.score.toFixed(1)} <Stars score={s.score} />
                </p>
                <p className="text-xs text-muted-foreground">{s.basis}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewScoreSection;