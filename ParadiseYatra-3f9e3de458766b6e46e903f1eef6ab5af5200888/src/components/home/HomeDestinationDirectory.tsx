import Link from "next/link";
import { ArrowRight, Compass, Globe2, MapPinned, Sparkles } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { backendJsonSafe, listFrom } from "@/lib/server/backend";
import { isSampleContent } from "@/lib/seo";

// Server component: renders straight into the home page HTML, so search engines see every destination page link
// (the rest of the home page loads as the visitor scrolls).

type PackageRow = { _id?: string; name?: string; slug?: string; tourType?: string; state?: string; country?: string; price?: number; isActive?: boolean };
type TagRow = { _id?: string; name?: string; slug?: string; packages?: Array<string | { _id?: string }> };
type Area = { name: string; href: string; count: number; from: number };

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const slugify = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

function groupAreas(packages: PackageRow[], tourType: "india" | "international"): Area[] {
  const areas = new Map<string, Area>();
  for (const pkg of packages) {
    if ((pkg.tourType === "international") !== (tourType === "international")) continue;
    const name = (tourType === "international" ? pkg.country : pkg.state)?.trim();
    if (!name) continue;
    const area = areas.get(name) || { name, href: `/package/${tourType}/${slugify(name)}`, count: 0, from: 0 };
    area.count += 1;
    const price = Number(pkg.price) || 0;
    if (price > 0 && (!area.from || price < area.from)) area.from = price;
    areas.set(name, area);
  }
  return Array.from(areas.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function AreaList({ title, icon, areas, allHref, allLabel }: { title: string; icon: React.ReactNode; areas: Area[]; allHref: string; allLabel: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <h3 className="flex items-center gap-2 text-base font-extrabold text-heading">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {title}
      </h3>
      <ul className="mt-4 grid gap-1 sm:grid-cols-2">
        {areas.map((area) => (
          <li key={area.href}>
            <Link
              href={area.href}
              className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary-light/60"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-heading group-hover:text-primary">{area.name} tour packages</span>
                <span className="block text-xs text-slate-500">
                  {area.count} {area.count === 1 ? "package" : "packages"}
                  {area.from ? ` · from ${inr(area.from)}` : ""}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
      <Link href={allHref} className="mt-3 inline-flex items-center gap-1 px-3 text-sm font-bold text-primary hover:underline">
        {allLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function HomeDestinationDirectory() {
  const [packagesData, tagsData] = await Promise.all([
    backendJsonSafe<unknown>("/api/all-packages?isActive=true&limit=2000", { revalidate: 300 }),
    backendJsonSafe<unknown>("/api/tags", { revalidate: 300 }),
  ]);
  const packages = listFrom<PackageRow>(packagesData, ["packages"]).filter(
    (p) => p.isActive !== false && !isSampleContent(p.name, p.slug)
  );
  if (!packages.length) return null;

  const india = groupAreas(packages, "india");
  const international = groupAreas(packages, "international");
  const activeIds = new Set(packages.map((p) => p._id));
  const themes = listFrom<TagRow>(tagsData, ["tags"])
    .map((tag) => ({
      name: (tag.name || "").replace(/^./, (c) => c.toUpperCase()),
      href: `/package/theme/${tag.slug}`,
      count: (tag.packages || []).filter((p) => activeIds.has(typeof p === "string" ? p : p?._id)).length,
    }))
    .filter((t) => t.name && t.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="border-t border-slate-100 bg-slate-50 px-4 py-14 md:px-8 md:py-16" aria-labelledby="home-directory-title">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Explore"
          eyebrowIcon={<Compass />}
          title={<span id="home-directory-title">Find your next holiday</span>}
          description={`Compare ${packages.length} tour packages across ${india.length + international.length} destinations in India and abroad. Every itinerary can be customised by our Dehradun-based travel experts.`}
          titleClassName="!text-[24px] sm:!text-3xl"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {india.length > 0 && (
            <AreaList title="India tour packages" icon={<MapPinned />} areas={india} allHref="/package/india" allLabel="All India tours" />
          )}
          {international.length > 0 && (
            <AreaList
              title="International tour packages"
              icon={<Globe2 />}
              areas={international}
              allHref="/package/international"
              allLabel="All international tours"
            />
          )}
        </div>
        {themes.length > 0 && (
          <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-heading">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              Holidays by theme
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {themes.map((theme) => (
                <li key={theme.href}>
                  <Link
                    href={theme.href}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {theme.name} tour packages <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-500">{theme.count}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/fixed-departures" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary">
                  Fixed departure group trips
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
