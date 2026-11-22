import type { LegalPage } from "@/lib/api/types";

const BLANK_LINE = "\n\n";

/**
 * The editor format used by the admin dashboard: "## Heading" starts a section, "- item" lines are
 * bullets and other lines are paragraphs separated by blank lines. Mirrors the backend LegalPageContent parser.
 */
export function legalPageToMarkup(page: LegalPage): string {
  return page.sections
    .map((section) => {
      const blocks = [`## ${section.heading}`, ...section.paragraphs];

      if (section.bullets?.length) {
        blocks.push(section.bullets.map((bullet) => `- ${bullet}`).join("\n"));
      }

      return blocks.join(BLANK_LINE);
    })
    .join(BLANK_LINE);
}
