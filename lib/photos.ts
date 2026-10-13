/**
 * The photography, and who took it.
 *
 * Every image is downloaded into /public/photos and served from this
 * origin — no runtime dependency on a third party. Both are under the
 * Unsplash Licence (free, commercial use permitted, no permission
 * required); each was checked individually for `plus: false` so nothing
 * here is an Unsplash+ image, which would need a paid licence.
 *
 * Attribution is not required by that licence. Who took each one is
 * kept here, so any image can be traced back to its source.
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
  boardDark: {
    src: "/photos/board-dark.jpg",
    alt: "A close-up of a motherboard in near darkness, with one edge catching the light.",
    by: "Vishnu Mohanan",
    handle: "vishnumaiea",
    id: "M0yAcynJr6M",
  },
  boardBlack: {
    src: "/photos/board-black.jpg",
    alt: "A black circuit board photographed against a black background.",
    by: "Blaz Erzetic",
    handle: "www_erzetich_com",
    id: "g5f0BJq-FRs",
  },
} as const satisfies Record<string, Photo>;

/**
 * The looping clip behind the title screen.
 *
 * Pexels Licence: commercial use permitted, modification permitted,
 * attribution not required.
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
