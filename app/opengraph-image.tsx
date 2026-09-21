import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The share card, generated at build time.
 *
 * The brief said not to reference an Open Graph image that had not been
 * created — so this creates one rather than leaving the tag off.
 *
 * It is the site's title screen with the photograph taken out. A
 * photographic 1200×630 PNG — and ImageResponse only emits PNG — came
 * out at 1.1 MB no matter how small the source was, because the size is
 * in the output entropy rather than the input. Flat black and type
 * encodes to a fraction of that, loads instantly in a feed, and is
 * closer to what the hero actually looks like anyway.
 */
export const alt =
  "Paradize — a home for hardware projects, documented once, versioned as they change, and reproducible by someone else.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const workSans = await readFile(join(process.cwd(), "assets/WorkSans.ttf"));
const fragmentMono = await readFile(
  join(process.cwd(), "assets/FragmentMono.ttf"),
);

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#010101",
        padding: "44px 56px 48px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Fragment Mono",
          fontSize: 20,
          letterSpacing: "3.4px",
          color: "#8a8a8a",
        }}
      >
        <div style={{ display: "flex" }}>PARADIZE.SPACE</div>
        <div style={{ display: "flex" }}>IN DEVELOPMENT</div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          fontFamily: "Work Sans",
          fontSize: 232,
          letterSpacing: "-12px",
          color: "#f1f1f1",
          lineHeight: 1,
        }}
      >
        PARADIZE
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontFamily: "Fragment Mono",
          fontSize: 20,
          letterSpacing: "3.4px",
          color: "#f1f1f1",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <div>A HOME FOR HARDWARE PROJECTS —</div>
          <div>DOCUMENTED ONCE, VERSIONED AS THEY CHANGE,</div>
          <div>REPRODUCIBLE BY SOMEONE ELSE.</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 9,
            color: "#8a8a8a",
          }}
        >
          <div>PLATFORM</div>
          <div>MARKETPLACE</div>
          <div>RESEARCH</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Work Sans", data: workSans, style: "normal", weight: 400 },
        {
          name: "Fragment Mono",
          data: fragmentMono,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
