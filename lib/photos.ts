/**
 * The photography, and who took it.
 *
 * Every image is downloaded into /public/photos and served from this
 * origin — no runtime dependency on a third party. All nine are under the
 * Unsplash Licence (free, commercial use permitted, no permission
 * required); each was checked individually for `plus: false` so nothing
 * here is an Unsplash+ image, which would need a paid licence.
 *
 * Attribution is not required by that licence but is rendered in the
 * footer anyway, because these are real photographs by real people.
 *
 * IMPORTANT: none of these show a Paradize product. Paradize has not
 * built one. They are atmosphere — benches, boards, hands, parts — and
 * the copy never implies otherwise.
 */

export type Photo = {
  src: string;
  alt: string;
  by: string;
  handle: string;
  /** Unsplash photo id, so a source image can be traced back. */
  id: string;
};

export const photos = {
  handsWiring: {
    src: "/photos/hands-wiring.jpg",
    alt: "A pair of hands wiring up an electronics project on a bench, with hand tools and a laptop alongside.",
    by: "Eric Stoynov",
    handle: "ericstoynov",
    id: "y25LI38cd9w",
  },
  chipPlace: {
    src: "/photos/chip-place.jpg",
    alt: "Tweezers placing a small black microchip onto a circuit board.",
    by: "Vishnu Mohanan",
    handle: "vishnumaiea",
    id: "zs4gtT8thO0",
  },
  soldering: {
    src: "/photos/soldering.jpg",
    alt: "Someone soldering a board at a workbench under a warm light.",
    by: "Blaz Erzetic",
    handle: "www_erzetich_com",
    id: "uM9Fz2eVhIM",
  },
  benchParts: {
    src: "/photos/bench-parts.jpg",
    alt: "A wooden workbench covered with electronic modules, cables and loose components.",
    by: "ThisisEngineering",
    handle: "thisisengineering",
    id: "LJGdVKuWmQM",
  },
  darkDesk: {
    src: "/photos/dark-desk.jpg",
    alt: "A dark room with a single desk lamp lighting a workspace.",
    by: "Ivan Oštrić",
    handle: "somewhatparanoid",
    id: "s9E7aE5iVWI",
  },
  boardDark: {
    src: "/photos/board-dark.jpg",
    alt: "A close-up of a motherboard in near darkness, with one edge catching the light.",
    by: "Vishnu Mohanan",
    handle: "vishnumaiea",
    id: "M0yAcynJr6M",
  },
  boardMono: {
    src: "/photos/board-mono.jpg",
    alt: "A black and white photograph of a computer motherboard seen from above.",
    by: "Albert Stoynov",
    handle: "albertstoynov",
    id: "b_GcLCaKt94",
  },
  boardBlack: {
    src: "/photos/board-black.jpg",
    alt: "A black circuit board photographed against a black background.",
    by: "Blaz Erzetic",
    handle: "www_erzetich_com",
    id: "g5f0BJq-FRs",
  },
  components: {
    src: "/photos/components.jpg",
    alt: "A circuit board covered in many small components, shot close and at an angle.",
    by: "Anne Nygård",
    handle: "polarmermaid",
    id: "vILVKROnyGA",
  },
} as const satisfies Record<string, Photo>;

export const photoCredits: Photo[] = Object.values(photos);

/**
 * The looping clip behind the title screen.
 *
 * Pexels Licence: commercial use permitted, modification permitted,
 * attribution not required — credited anyway, as the photographs are.
 * No identifiable people and no brands appear in it, which is where that
 * licence draws its lines.
 */
export const heroVideo = {
  src: "/videos/hero-board.mp4",
  /**
   * The clip's own first frame, pulled with ffmpeg at build-prep time.
   *
   * The poster used to be a different photograph, which meant the swap
   * from still to film was a dissolve between two unrelated boards. Now
   * the still IS frame zero, so there is nothing to dissolve: the image
   * simply starts moving.
   */
  poster: "/photos/hero-frame.jpg",
  alt: "A dark green circuit board seen close up and at an angle, lit in blue, with memory chips, capacitors and a transformer in shallow focus.",
  by: "Tima Miroshnichenko",
  href: "https://www.pexels.com/video/close-up-view-of-a-motherboard-6754818/",
  id: "6754818",
} as const;

export const unsplashProfile = (handle: string) =>
  `https://unsplash.com/@${handle}?utm_source=paradize&utm_medium=referral`;
