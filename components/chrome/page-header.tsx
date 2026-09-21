import Image from "next/image";

import { Words } from "@/components/chrome/words";
import type { Photo } from "@/lib/photos";

/**
 * The opening of a page that is not the landing page.
 *
 * Deliberately not a second monument screen: the name at 21vw is the
 * front door and repeating it on every page would flatten it. This is
 * the same language at a lower volume — mono index, display heading,
 * one lede, one full-bleed photograph beneath — so /marketplace reads
 * as another sheet of the same document rather than another website.
 */
export function PageHeader({
  index,
  label,
  heading,
  lede,
  photo,
}: {
  index: string;
  label: string;
  heading: string;
  lede: string;
  photo: Photo;
}) {
  return (
    <header className="relative">
      <div className="mx-auto max-w-page px-4 pt-28 pb-14 sm:px-6 sm:pt-36 sm:pb-20">
        <div className="flex items-start gap-4">
          <p className="mono text-dim tnum shrink-0 -translate-y-[0.35em]">
            {index}
          </p>
          <span className="ruler grow" />
          <p className="mono text-dim shrink-0 -translate-y-[0.35em]">
            {label}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-x-12">
          <Words as="h1" className="text-display lg:col-span-7">
            {heading}
          </Words>
          <p className="text-lead text-mute self-end lg:col-span-4 lg:col-start-9">
            {lede}
          </p>
        </div>
      </div>

      <div className="relative aspect-21/9 w-full overflow-hidden sm:aspect-3/1">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="photo parallax object-cover"
        />
      </div>
    </header>
  );
}
