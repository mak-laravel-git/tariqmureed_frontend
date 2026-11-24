interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Structured data for search engines (schema.org) as a JSON-LD script; "<" is escaped so the text cannot close the tag. */
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
