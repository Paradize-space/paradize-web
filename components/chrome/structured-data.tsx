/**
 * Organization and WebSite markup.
 *
 * Deliberately thin. There is no `foundingDate`, no `founder`, no
 * `sameAs`, no `address` and no `contactPoint`, because none of those
 * are known facts that can be stated here — and structured data is
 * exactly the wrong place to guess. Only the name, the URL, the logo
 * that actually exists, and the same description the page carries.
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://paradize.space/#organization",
        name: "Paradize",
        url: "https://paradize.space",
        logo: "https://paradize.space/icon.svg",
        description:
          "A home for hardware projects: documented once, versioned as they change, and reproducible by someone else. Paradize is in development.",
      },
      {
        "@type": "WebSite",
        "@id": "https://paradize.space/#website",
        url: "https://paradize.space",
        name: "Paradize",
        inLanguage: "en",
        publisher: { "@id": "https://paradize.space/#organization" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // The payload is a literal defined immediately above — no user or
      // network input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
