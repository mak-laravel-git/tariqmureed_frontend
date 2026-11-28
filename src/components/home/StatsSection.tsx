import { AdSlot } from "@/components/ui/AdSlot";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBattingLeaders, getMostRead } from "@/lib/api/endpoints";

import { LeadersTable } from "./LeadersTable";
import { AsideHeading, HeadlineItem } from "./LatestNews";

export async function StatsSection() {
  const [leaders, mostRead] = await Promise.all([getBattingLeaders(), getMostRead()]);

  return (
    <Section aria-labelledby="stats-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,904fr)_minmax(0,320fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionHeading
            id="stats-title"
            title="Number Crunching"
            description="Leading run-scorers across the current season."
            action={{ href: "/stats", label: "View all" }}
          />

          {leaders.rows.length > 0 ? (
            <LeadersTable leaders={leaders} />
          ) : (
            <p className="rounded-lg border border-line bg-white px-4 py-10 text-center text-sm text-muted">
              Season statistics are not available right now.
            </p>
          )}
        </div>

        <aside aria-label="Most read" className="flex min-w-0 flex-col gap-6">
          <div>
            <AsideHeading display>Most Read</AsideHeading>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {mostRead.map((article) => (
                <HeadlineItem key={article.id} article={article} titleSize="lg" />
              ))}
            </div>
          </div>

          <AdSlot placement="home-stats" />
        </aside>
      </div>
    </Section>
  );
}
