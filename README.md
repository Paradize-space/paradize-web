# Paradize

**Paradize is a home for people who build hardware.** Document hardware
projects, version the hardware and software together, check what you already
have, and source what you still need. Paradize is in development.

This repository is the source of the website at
**[paradize.space](https://paradize.space)**: the pre-launch homepage for one
organisation with three connected streams — a platform for documenting and
versioning hardware projects, a marketplace for the parts those projects need,
and an internal research stream.

It is a landing page with one small local concept demonstration. It is not
the platform, the marketplace or a research portal.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19, TypeScript
- Tailwind CSS v4 — design tokens in `app/globals.css` under `@theme`
- `next/font` — **Work Sans** (everything a reader reads) and **Fragment Mono**
  (everything a reader scans), self-hosted at build
- **shadcn** registry components (`components.json`, style `base-nova`, Base UI
  underneath): AspectRatio, Badge, Button, Checkbox, Empty, Field, Input,
  Label, Separator, Sheet, Table, Tabs. shadcn's semantic tokens are remapped
  in `globals.css` onto the palette below, so registry components arrive in the
  right register instead of the default look.
- **lenis** for smooth scrolling. Scroll-driven _animation_ is plain CSS —
  see below.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

## The design

The register, measured rather than guessed:

- the ground is **very nearly pure black** (`#010101`) and the ink is a warm
  off-white (`#f1f1f1`). There is no third neutral doing real work —
  separation comes from photography and from hairline rules.
- **one typeface at one weight.** Work Sans at 400 carries the 300px display
  type and the body copy alike. Nothing on the page is bold; `globals.css`
  forces `h1–h4`, `strong` and `b` back to 400. Scale carries the hierarchy,
  and tracking tightens as size grows (−0.055em on the display, −0.015em on a
  paragraph).
- **a monospace for everything scannable** — captions, nav, spec rows,
  numerals — uppercase, tracked out to 0.16em, at 11px.
- the display type is set at **21vw** and runs past the edges of the screen.
- photography is **full-bleed, dark and top-lit**, and the layout is built
  around it rather than decorated with it.

Signal colour is spent only inside the requirement check, where green / amber /
red mean _free_, _committed elsewhere_ and _not held_. Nowhere else.

**The ground never changes.** An inverted off-white section was tried and
removed: on this page it broke the register rather than giving it rhythm. The
only off-white surfaces are the two small waitlist cards. If a light band is
ever reconsidered, note that the fixed header has no background of its own and
its nav and scrim will vanish into it.

## Motion

Most of the feel comes from headings whose words rise in one after another,
the effect usually built with GSAP's **SplitText**. It needs no assets, and
here it needs no JavaScript either.

**All CSS scroll-driven animation** (`animation-timeline: view()`), no
JavaScript:

| effect                                                                  | where                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| words rising out from behind a mask, staggered                          | every display heading, via `components/chrome/words.tsx`                                                     |
| the measuring edge drawing itself across, graduations trailing the rule | every section divider                                                                                        |
| hairline rules drawing in from the left                                 | every `.ruled` row                                                                                           |
| photographs drifting against their frames                               | every section image                                                                                          |
| the name receding as the photograph pushes forward                      | the title screen, on exit                                                                                    |
| the signature rising                                                    | the footer                                                                                                   |
| a progress hairline                                                     | under the header — `scroll(root)`, not `view()`, since it tracks the page rather than an element crossing it |

One time-based animation remains: the release panel fades in on switch.
Changing release is the page's only real interactive moment and it used to
happen with no transition at all. Base UI renders only the selected panel, so
a plain entry animation replays on every switch.

The word stagger is worth a note: `animation-delay` means nothing on a scroll
timeline, so the heading declares a named `view-timeline` and each word hangs
off that same timeline starting at a different point on it
(`animation-range: entry calc(6% + var(--i) * 2.2%) …`).

Splitting is by **word, never by character** — per-character splitting is what
makes some screen readers spell a heading out letter by letter. The space goes
_between_ the word spans; parked inside an `overflow: hidden` inline-block it
gets clipped and every word in the heading runs together.

This all replaced `motion`, which cost 119 KB of the bundle to fade some text
up; the total went from 899 KB to 771 KB while gaining six more effects.

All of them sit behind two gates — `@supports (animation-timeline: view())` and
`prefers-reduced-motion: no-preference`. Where either fails (Firefox, at the
time of writing) the rules never apply: words sit at rest, hairlines are drawn
at full width, photographs are static. Nothing is ever hidden waiting for an
animation that cannot run.

`lenis` stays, because the inertia is a large part of how the page feels. It
does not initialise at all under reduced motion — hijacking the scroll is
exactly what that setting is asking you not to do.

## The measuring edge

`components/chrome/ruler.tsx` is the page's one recurring graphic mark, and
the only vector graphic on it. Before it, every section was photography, type
and plain rules, which left the page with nothing of its own between sections.

A graduated ruler earns its place because it is not decoration: Paradize is
about measuring a build against what you hold, and a measuring edge says that
in the same hairline-and-mono language everything else already speaks. The
graduations are two repeating gradients, so a full-width ruler costs two
pseudo-elements and no markup.

It is also the labelling system. The sections used to carry their own mono
kickers, which meant two mono labels stacked a few pixels apart; those are
gone and the ruler names each section instead. It reads `03/07 ——— ROUTE`, a
fraction rather than a bare ordinal, because the stream tiles inside the page
are numbered 01–03 on their own scale and two bare ordinals in view at once
read as one sequence.

## Photography

Nine photographs in `public/photos`, listed with attribution in `lib/photos.ts`
and credited in the footer. All are under the **Unsplash Licence** (free,
commercial use permitted, no permission required); each was checked
individually to confirm it is not an Unsplash+ image, which would need a paid
licence. They are served from this origin, so there is no runtime dependency on
a third party.

**None of them shows a Paradize product** — there is not one yet. They are
atmosphere: benches, boards, hands, parts. The copy never implies otherwise,
and the one photograph placed next to sample-project data is captioned
"Illustrative photograph — not the sample project".

Pinterest was considered and rejected as a source: it is a repost board, almost
everything on it is third-party copyrighted work, and there is no licence to
put it on a commercial site.

## Sample data

The interactive section runs on a **fictional** project fixture in
`lib/data/desk-sensor.ts`. It is not connected to an account, a repository, a
supplier or a live inventory, and it is labelled as sample data on the page.

The vocabulary the fixture uses:

| term           | meaning                                                  |
| -------------- | -------------------------------------------------------- |
| project        | the evolving design                                      |
| release        | a fixed, published snapshot of that design               |
| personal build | someone's physical implementation of a release           |
| fork           | a separate development line derived from another project |

An inventory **check** compares a release's requirements against what you hold.
It never reserves, consumes or reclaims anything — a part installed in another
build counts as _in use_, not as _ready_.

## The waitlist

`lib/waitlist/adapter.ts` is the only module that knows how a signup is stored.
Until `WAITLIST_WEBHOOK_URL` is set, it returns `{ status: "unconfigured" }`,
the route answers **501**, and the form renders an explicit _Not stored_ panel.

**It never shows success for an address it did not store.** That is the point
of the adapter, and it is worth keeping when you connect a real store.

```bash
WAITLIST_WEBHOOK_URL=https://…      # required to actually store signups
WAITLIST_WEBHOOK_TOKEN=…            # optional, sent as Authorization: Bearer
```

The endpoint receives a JSON body shaped like `WaitlistSignup`. Response codes:
`201` stored, `501` no store connected, `400` invalid address, `502` the store
failed.

## Routes and metadata

| route              | source                    | notes                                                        |
| ------------------ | ------------------------- | ------------------------------------------------------------ |
| `/`                | `app/page.tsx`            | the page                                                     |
| `/opengraph-image` | `app/opengraph-image.tsx` | generated at build with `next/og`                            |
| `/robots.txt`      | `app/robots.ts`           | allows everything except `/api/`                             |
| `/sitemap.xml`     | `app/sitemap.ts`          | the three pages, each dated by its last real change          |
| `/icon.svg`        | `app/icon.svg`            |                                                              |
| 404                | `app/not-found.tsx`       | styled; Next's default is white and reads as a broken deploy |

The share card is **black and type**, not the hero photograph. `ImageResponse`
only emits PNG, and a photographic 1200×630 PNG came out at 1.1 MB regardless
of how small the source was — the weight is in the output entropy. Flat black
encodes to 53 KB, loads instantly in a feed, and looks like the hero anyway.
Fonts for it are static TTFs in `assets/`, read at build time.

`components/chrome/structured-data.tsx` emits Organization and WebSite JSON-LD
on the home page, which is the only place Google reads a site name from. It
is deliberately thin — no `founder`, `foundingDate`, `sameAs` or
`contactPoint`, because none of those are known facts, and structured data is
the worst possible place to guess.

**The site's address and names live in `lib/site.ts`**, and everything that
tells a crawler who we are reads from there: the canonical links, the sitemap,
`robots.txt` and the structured data. The name is **Paradize**. The alternate
names are "Paradize Space", which is what people type when they are told the
address out loud and do not know `.space` is a domain ending, and the domain
itself. The address is the apex, `https://paradize.space`; www redirects to it
with a 308.

**Sitemap dates are written by hand.** Google only trusts `<lastmod>` when it
is consistently accurate, so a build-time date that says "now" on every deploy
teaches it to ignore the field. When a page's main copy, links or structured
data change, bump that page's date in `app/sitemap.ts`; leave it alone for a
style pass.

## Notes for Next.js 16

`priority` on `next/image` is **deprecated** in this version. The hero uses
`loading="eager"` with `fetchPriority="high"`, which is what the bundled docs
in `node_modules/next/dist/docs` now recommend.

## Accessibility

- one `<h1>`, headings in order, no skipped levels
- every image has a real `alt`; decorative type is `aria-hidden`
- all text passes WCAG AA against its actual composited background
  (measured through a canvas, so `oklab()` and alpha resolve correctly)
- no horizontal overflow at 390px or 1440px
- `prefers-reduced-motion` disables the scroll entrances and Lenis entirely
- the waitlist form announces both failure states through a live region
- the floating waitlist card uses `inert` when off-screen, not `aria-hidden` —
  `aria-hidden` on a container holding a link and a button leaves those
  controls in the tab order while hiding them from the accessibility tree,
  so a keyboard user lands on something a screen reader will not name

## The live background

The title screen runs a looping muted clip of a dark board under the same
scrim and the same `.photo` filter as the stills, so it sits in the identical
register. `components/sections/hero-media.tsx`.

It is layered **on top of** the poster photograph rather than replacing it:

- the image stays the LCP element, so the largest paint is a ~200 KB JPEG and
  not a 5.6 MB video
- if the video never arrives — blocked, throttled, autoplay refused — the hero
  is simply the photograph, which is what it was before
- it crossfades in on `canplay`, so there is no black frame and no pop

It does not load **at all** under `prefers-reduced-motion`, or below 768px,
where 5.6 MB is somebody's mobile data for a background that is mostly behind
a scrim. Both gates are verified: desktop mounts and plays, mobile renders no
`<video>` element and keeps the still.

Clip 6754818 by Tima Miroshnichenko, **Pexels Licence** — commercial use and
modification permitted, attribution not required (credited in the footer
anyway). No identifiable people and no brands appear in it, which is where
that licence draws its lines.

## Copy

The copy is held to five rules. The design was never the problem; the
sentences were. Scored against these five patterns, the first draft carried
**32 flags across 35 sentences** — roughly one per sentence:

| pattern                                                                      | before | after |
| ---------------------------------------------------------------------------- | ------ | ----- |
| define-by-negation (`not a folder of files`, `rather than`, `more than its`) | 9      | 0     |
| em dash as a rhetorical pivot                                                | 7      | 0     |
| triads (`a, b, and c`)                                                       | 7      | 0     |
| `nothing` constructions                                                      | 4      | 0     |
| filler intensifiers (`actually`, `dedicated`, `simply`)                      | 5      | 1     |

Define-by-negation was the worst of it. Used once it is emphasis; used nine
times in seven sections it is a tic, and it was the single strongest signal
that nobody had actually read the page back.

Headings were all the same shape too — six to nine words, abstract,
declarative, full stop, seven times. They are now a mix of fragments, one long
declarative and one imperative, at different lengths.

Two things were deliberately **left alone**:

- the fixture prose in `lib/data/desk-sensor.ts` (`Four M2 screws`, `115200
baud`, `heat from the regulator stops skewing readings`). Concrete technical
  detail is what these rules exist to protect.
- every honesty label — `Sample project · not a live account`, `Preview · no
store connected`, `Illustrative photograph — not the sample project`. Those
  contain `not`, and they stay: they are functional disclosure, not rhetoric.

The em dashes still on the page are all structural — list separators
(`01 — PLATFORM`), a caption separator, and a table cell where `—` means _not
applicable_. None is a rhetorical pivot.

### The hero.s two layers

The dimming belongs on the **wrapper**, not on the image and the video
separately. Putting 70% on each meant the clip never fully covered the still
underneath it:

```
before   wrapper 1.0 · image 0.7 · video 0.7
         → 0.70·video + 0.21·image      the still is 21% of every pixel
after    wrapper 0.7 · image 1.0 · video 1.0
         → 0.70·video                   the still is occluded outright
```

Because the poster and the clip are two different boards, that 21% showed as a
permanent double exposure for as long as the page was open. Opaque children
under a dimmed parent is the fix; the crossfade is also short now, since a
long dissolve between two different compositions reads as a ghost rather than
as a cut.

The poster is the clip's **own first frame**, pulled out with ffmpeg
(`public/photos/hero-frame.jpg`). It used to be a different photograph, which
meant the handoff from still to film was a dissolve between two unrelated
boards; now the picture simply starts moving. The photograph that used to sit
there is gone from the repo along with its credit.

That frame is much darker than the stock stills it replaced — 37/255 against
roughly 74 — so the shared `.photo` treatment crushed it to 12/255, which
reads as black. The hero has its own `.photo-hero` exposure, solved by
compositing the real frame through candidate filters on a canvas and matching
the hero's previous 32/255. It lands on 32.1 with no clipped pixels.

## Pages

| route          | what it is                          |
| -------------- | ----------------------------------- |
| `/`            | the platform, and only the platform |
| `/marketplace` | components and kits                 |
| `/research`    | the internal research stream        |

Marketplace and research used to be sections of the landing page. They are
pages now, so the landing page is about the one thing Paradize actually is,
and the streams section is where you leave for the other two.

Three things had to change to make that work, none of them obvious from the
page itself:

- **Every nav href is absolute.** `#platform` resolves against whatever page
  you are on, so it silently did nothing from `/marketplace`. They are
  `/#platform` now, and `lib/nav.ts` marks each item `anchor` or `route`.
- **The header tracks the two kinds differently.** An anchor is current when
  its section owns the middle of the viewport; a route is current when
  `usePathname()` matches. The old code fed the href straight to
  `querySelector`, which throws on `/#platform`.
- **Lenis had to learn the difference.** Its click handler matched
  `a[href^="#"]` only, so absolute same-page links bypassed smooth scrolling.
  It now compares origin and pathname, and leaves genuine cross-page
  navigation alone.

Each page ends with the waitlist, so the floating CTA has somewhere to point
and the form is never more than one screen away.

### Marketplace and research

Both were sections lifted onto pages of their own, and at first that showed:
each had one content heading and roughly 250 words before the waitlist, with
none of the ruler system that organises the landing page. They read as
offcuts.

They now carry the same divider system, labelled rather than numbered — the
page header holds the site-level number and two numbering scales on one page
would only compete.

**Marketplace** gained two blocks, both grounded rather than written to fill
space:

- _Four ways a line can go_ renders the actual branches of
  `checkRequirements()`. Labels and descriptions come straight out of
  `statusCopy`, so the explanation cannot drift from the table on the landing
  page that uses the same states. A kit is whatever comes back `missing`.
- _What this is not, yet_ takes the small "no store connected" badge and
  gives it full size. Every line is a statement of absence, so none of it can
  age into a false claim — when one becomes untrue it gets deleted, not
  rewritten.

**Research** is now one line and a status. It carried more — an empty-state
readout, a set of boundary statements, its own waitlist — and all of it was
true, but it was several screens of copy in front of a stream that has
published nothing. A page that says one honest thing is a better answer to
having nothing to show than four sections explaining the nothing. Anyone who
wants telling can still use the `Research` box on the waitlist, which is
reachable from the standing card and from the other two pages.

Behind it is an observation cupola — seven panes on the ISS module's
arrangement, set into a bulkhead, with a warp field running past outside. It
is drawn: one even-odd path with seven holes in it laid over the view, so the
holes are the only places the view survives, with the structure's metal taken
from a photograph and a lighting ramp multiplied over it.

The thing that took longest to get right was not the drawing. The scene sits
under the same grade every photograph here obeys, near enough — the site is
one off-white ink on `#010101` and nothing shouts, and a scene rendered at
full chroma cannot sit in that however convincing it is alone. It reads as a
different website pasted in. Graded down, with the trails off-white and the
three colour fields reduced to greys turned a few degrees warm, neutral and
cool, it becomes part of the same document.

`statusTone` moved to `lib/status-tone.ts` so the marketplace explanation and
the platform table cannot drift apart.

### The marketplace preview

`components/sections/clone-demo/` plays the flow back like a screen
recording: a profile, a project, clone it, check the parts against your own
shelf, search for the one line you lack, add it to a cart. A pointer drives
it and a camera follows.

It is split four ways, because at 859 lines in one file the interesting parts
were unreadable:

- `lib/data/demo-flow.ts` — the beats. Pure data: what is on screen, how long
  it holds, what the camera frames. The thing most likely to be edited, and
  editing it should not mean opening a file full of JSX.
- `clone-demo/camera.ts` — the coordinate arithmetic. `offsetWithin` walks
  `offsetParent` rather than using `getBoundingClientRect`, because the
  content is being scaled and a client rect would report post-transform
  coordinates and send the camera chasing its own tail.
- `clone-demo/screens.tsx` — the three screens, each handed only the marks it
  owns.
- `clone-demo/index.tsx` — the player: clock, transport, window.

Two things are deliberately missing from the listings. No prices and no
sellers, because nothing is connected and any figure in those columns would
be invented. And the titles describe a class of part rather than naming the
product in the photograph — the photographs are real components under a stock
licence, and captioning a real manufacturer's board as something Paradize
lists would imply a supplier relationship that does not exist.

One layout bug worth recording: `.ruled`'s closing rule hangs off
`:last-child`, which in a two-column grid is only the bottom-right cell, so
the rule stopped half way across. `.ruled-grid` moves it to the container.

### The preview

`components/sections/clone-demo.tsx` plays the flow rather than describing
it: a pointer clones a release, the check resolves against what you hold, and
the one line you are short of goes into a kit. Five phases on a loop.

It is labelled a preview on its face, because none of that interface exists.
It is called a **kit**, not a cart — that is the product's own word, and there
is no store, pricing or checkout for a cart to sit in front of.

Rows and states come from the same fixture as everything else, so the preview
cannot show a result the real check would not.

The camera is the other half of it. Each phase names a target and a
distance, and the content layer is translated and scaled so that target
lands in the middle of the frame: wide at rest, 1.55x into the Clone
button, back to 1.12x across the list while the states resolve, 1.6x into
the Add control, then all the way back out so the finished state is seen
whole. The pointer rides inside that layer, so it scales with the zoom the
way a cursor does in a real recording.

Four things it gets right that are easy to get wrong:

- **The parts list is present from the first frame**, and only the _status_
  resolves. Hiding the rows left the window holding a large void for two
  phases, and implied the list arrives from somewhere rather than being part
  of the release.
- **The transport sits above the window.** Below it, the floating waitlist
  card covers the pause control on a phone — and for looping content a pause
  control is a WCAG 2.2.2 requirement, not decoration.
- **The action slot is reserved on every row**, not only the one that fills
  it, or the missing row's badge sits left of the others.

The window is `aria-hidden` with a text equivalent beside it, since a screen
reader cannot follow a moving pointer. Under `prefers-reduced-motion` it does
not animate at all — it renders the finished state and stays there.

Two more, specific to the camera:

- **Positions are read from `offsetParent`, not `getBoundingClientRect`.**
  The layer being measured is the same layer being scaled, so rects would
  report post-transform coordinates and the camera would chase its own tail.
- **A target that spans the window is framed from its left edge**, not its
  centre. Centring a full-width row crops both sides evenly, which eats the
  part numbers — and rows read from the left.

The push-in eases off below 560px. A 1.6× crop of a 390px frame leaves almost
nothing either side of the control, which stops reading as a camera move and
starts reading as a broken layout.
