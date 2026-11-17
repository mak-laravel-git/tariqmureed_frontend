import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ui/AdSlot";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { MapPinIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { PageIntro } from "@/components/ui/PageIntro";
import { getLegalPage } from "@/lib/api/endpoints";
import { cn } from "@/lib/cn";

/** Privacy policy / terms of use layout: sectioned text with a drop cap and a contact card. */
export async function LegalPageView({ slug }: { slug: string }) {
  const page = await getLegalPage(slug);

  if (!page) {
    notFound();
  }

  const compact = slug === "privacy-policy";

  return (
    <>
      <PageIntro eyebrow="Legal" title={page.title} description={page.description} uppercase />

      <Container className="pt-8 pb-8">
        <Breadcrumbs
          separator="›"
          className="text-[11px] leading-[16.5px] font-normal text-[#6b7280]"
          items={[{ label: "Home", href: "/" }, { label: page.title }]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_413px]">
          <div className={cn("flex flex-col", compact ? "gap-9" : "gap-8")}>
            {page.sections.map((section) => (
              <section key={section.heading} aria-labelledby={`legal-${section.heading}`}>
                <h2
                  id={`legal-${section.heading}`}
                  className={cn(
                    "flex items-center uppercase text-[#111827]",
                    compact
                      ? "gap-2 text-xs leading-4 font-semibold tracking-[0.6px]"
                      : "gap-2 text-base leading-6 font-semibold tracking-[0.4px]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0",
                      compact ? "h-3.5 w-1 bg-[#f5c400]" : "h-4 w-1.5 rounded-full bg-[#fbbf24]",
                    )}
                  />
                  {section.heading}
                </h2>

                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "mt-3 max-w-[760px] text-sm leading-[22.75px] text-[#374151]",
                      index === 0 &&
                        (compact
                          ? "first-letter:float-left first-letter:mr-3 first-letter:text-[60px] first-letter:leading-[48px] first-letter:font-bold first-letter:text-[#111827]"
                          : "first-letter:float-left first-letter:mr-3 first-letter:text-[56px] first-letter:leading-[48px] first-letter:font-bold first-letter:text-[#111827]"),
                      index > 0 && "mt-4",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-6 lg:self-start">
            <div className="rounded-lg border border-[#27272a] bg-[#121212] p-[21px] text-white shadow-sm">
              <ShieldCheckIcon width={16} height={16} className="text-[#f5c400]" />
              <h2 className="mt-2 text-base leading-6 font-normal">Need to reach us?</h2>
              <a
                href={`mailto:${page.contact.email}`}
                className="mt-2 block text-xs leading-4 text-[#d4d4d8] hover:underline"
              >
                {page.contact.email}
              </a>
              <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-[15px] text-[#a1a1aa]">
                <MapPinIcon width={14} height={14} className="mt-0.5 shrink-0 text-[#f5c400]" />
                {page.contact.address}
              </p>
              <a
                href={`mailto:${page.contact.email}`}
                className="mt-3 flex items-center justify-center rounded-[4px] bg-[#f5c400] px-4 py-4 text-base leading-4 font-medium tracking-[0.3px] text-black uppercase transition-colors hover:brightness-95"
              >
                Contact the newsroom
              </a>
            </div>

            <AdSlot format="300 × 250 — Medium Rectangle" className="min-h-[260px] rounded-lg uppercase tracking-[0.1em]" />
          </aside>
        </div>
      </Container>
    </>
  );
}
