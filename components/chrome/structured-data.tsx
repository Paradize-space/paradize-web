import { absolute, pages, type Page } from "@/lib/pages";
import {
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_SOCIALS,
  SITE_URL,
} from "@/lib/site";

/**
 * Organization and WebSite markup.
 *
 * Deliberately thin. There is no `foundingDate`, no `founder`, no
 * `address` and no `contactPoint`, because none of those are known
 * facts that can be stated here — and structured data is exactly the
 * wrong place to guess. Only the name, the domain people know it by,
 * the URL, the logo that actually exists, the same description the page
 * carries, and `sameAs`: the company's own X and LinkedIn accounts,
 * checked before they went in (lib/site.ts).
 *
 * Google takes the site name shown in results from the WebSite entry,
 * and only reads it on the home page, which is why this renders there
 * and nowhere else. The Organization entry carries the same names so
 * the two never disagree. The home page itself is a WebPage about the
 * organisation; the other pages carry their own (see PageData below).
 */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        sameAs: SITE_SOCIALS.map((s) => s.href),
        description:
          "A home for hardware projects: documented once, versioned as they change, and reproducible by someone else. Paradize is in development.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      webPage(pages.home),
    ],
  };

  return <Json data={data} />;
}

/** A page as schema.org has it: part of the site, about Paradize. */
function webPage(page: Page) {
  const url = absolute(page.path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.path === "/" ? page.title : `${page.title} — ${SITE_NAME}`,
    description: page.description,
    dateModified: page.updated,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * The WebPage entry for a page below the home page, and the trail that
 * leads to it, so a result can show "Paradize › Marketplace".
 */
export function PageData({ page }: { page: Page }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPage(page),
        breadcrumb: { "@id": `${absolute(page.path)}#trail` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absolute(page.path)}#trail`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.name,
            item: absolute(page.path),
          },
        ],
      },
    ],
  };
  return <Json data={data} />;
}

function Json({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built only from constants in this repo — no user
      // or network input reaches it. "<" is escaped so no string in it
      // can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
