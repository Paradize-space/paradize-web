<script setup lang="ts">
/**
 * The one email a waitlist signup gets: a short letter from Jagrit.
 *
 * The words live once, in `letter` below, and render into both the HTML
 * and the text/plain part, so the two can never drift apart. Text inside
 * [[double brackets]] is a placeholder: `npm run build` refuses to ship
 * an email that still has one (see scripts/build-emails.mjs).
 *
 * `subject` and `from` are read by the build script, so the subject line
 * and the sender's name live with the email they belong to.
 */
defineConfig({
  subject: "A small thank you",
  from: "Jagrit from Paradize",
});

/**
 * Jagrit's photo, public/email/jagrit.jpg: 168px square, three times the
 * 56px it shows at, so it stays sharp on high-density screens.
 *
 * Images are written as paths into public/. The preview server
 * (`npm run emails:dev`) serves them from there, and the build prefixes
 * https://paradize.space, since a mail app loads them from the live site.
 */
const photo = "/email/jagrit.jpg";

type Part = { text: string; href?: string };

const letter: Part[][] = [
  [{ text: "Hi," }],
  [
    {
      text: "You are one of the first people to join the Paradize waitlist, and I wanted to personally thank you.",
    },
  ],
  [
    {
      text: "We are building Paradize because most hardware projects die in the gap between finding one and building it. Files drift, instructions go stale, and nobody writes down which board revision the photos belong to.",
    },
  ],
  [
    {
      text: "Paradize closes that gap. A project is written down once and published as releases, so the version someone builds is a version that was really shipped.",
    },
  ],
  [
    {
      text: "Being early means you get a say. You will be among the first to try Paradize as it comes together, and what you tell us will shape it. The team's current work is already open on ",
    },
    { text: "the research page", href: "https://paradize.space/research" },
    { text: "." },
  ],
  [
    {
      text: "If you build hardware, reply and tell me what you are making. I read every reply.",
    },
  ],
  [{ text: "Thank you for being early." }],
];

/**
 * The footer. X is the account the Paradize-space GitHub organisation
 * lists as its own. GitHub itself is never linked from an email. The
 * links are words, not icons: an icon is an image, and a dark icon
 * disappears when Gmail darkens the letter around it.
 *
 * `mark` is app/icon.svg as a PNG, since Gmail does not show SVG.
 */
const links = [
  { text: "Research", href: "https://paradize.space/research" },
  { text: "Marketplace", href: "https://paradize.space/marketplace" },
  { text: "X", href: "https://x.com/paradize_space" },
  /**
   * Every email carries this link, and the build fails without it.
   * sendEmail() puts the recipient's own token in place of the marker.
   */
  {
    text: "Unsubscribe",
    href: "https://paradize.space/unsubscribe?t=__UNSUBSCRIBE_TOKEN__",
  },
];

const copyright = `© ${new Date().getFullYear()} Paradize`;

const mark = "/email/mark.png";

const plain = (parts: Part[]) =>
  parts.map((p) => (p.href ? `${p.text} (${p.href})` : p.text)).join("");

/**
 * The text/plain part, from the same words. Maizzle's converter only keeps
 * a blank line for a <br>, an &nbsp; and a <br> on lines of their own, and
 * Vue drops the newlines between template tags, so the markup is built
 * here as one string and handed to v-html, which keeps it as written.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const plaintextHtml = [
  ...letter.map(plain),
  "Jagrit from Paradize",
  `--\n${links.map((l) => `${l.text}: ${l.href}`).join("\n")}`,
  copyright,
]
  .map((paragraph) => escapeHtml(paragraph).replace(/\n/g, "<br>\n"))
  .join("<br>\n&nbsp;<br>\n");

/**
 * Warm paper by default, and the site's own black (app/globals.css) when
 * the reader's mail app is in dark mode. Each colour is inlined for the
 * light letter; the `dark:` half stays in a media query, and needs `!` to
 * win over the inlined style. Apple Mail and iOS Mail follow it. Gmail and
 * Outlook.com ignore it and darken the paper letter themselves.
 */
const c = {
  page: "bg-[#f6f4ec] dark:bg-[#010101]!",
  ink: "text-[#18181b] dark:text-[#f1f1f1]!",
  dim: "text-[#6b6b70] dark:text-[#787878]!",
  rule: "border-[#e3dfd2] dark:border-[#1c1c1e]!",
};
</script>

<template>
  <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <meta
        name="format-detection"
        content="telephone=no, date=no, address=no, email=no, url=no"
      />
      <!--
        source(none): build only the classes this email uses. Without it
        Tailwind scans the whole repository, website included.
      -->
      <style>
        @import "@maizzle/tailwindcss" source(none);

        /* Apple Mail applies the dark: styles only after this opt-in. */
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }

        @theme {
          --font-sans: "Work Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          --font-mono: "Fragment Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
        }
      </style>
    </Head>

    <Font family="Work Sans" :weights="[400, 500]" />
    <Font family="Fragment Mono" />

    <Body :class="['m-0 p-0', c.page]">
      <NotPlaintext>
        <!-- The inbox preview line. The filler keeps the letter itself
             from spilling into the preview after it. -->
        <div class="hidden max-h-0 overflow-hidden">
          You are one of the first people on the Paradize waitlist.<template
            v-for="i in 60"
            :key="i"
            >&#8199;&#65279;&#847; </template
          >
        </div>

        <Section :class="['w-full', c.page]">
          <Container :class="['max-w-[560px] px-6 pt-16 pb-14 font-sans', c.ink]">
            <Section class="pb-12 text-center">
              <Link
                href="https://paradize.space"
                :class="['text-[15px] leading-none tracking-[0.34em] uppercase no-underline', c.ink]"
              >
                Paradize
              </Link>
            </Section>

            <Text
              v-for="(parts, i) in letter"
              :key="i"
              :class="['m-0 mb-5 text-base leading-[26px]', c.ink]"
            >
              <template v-for="(part, j) in parts" :key="j">
                <Link
                  v-if="part.href"
                  :href="part.href"
                  :class="['underline', c.ink]"
                  >{{ part.text }}</Link
                ><template v-else>{{ part.text }}</template>
              </template>
            </Text>

            <!-- A plain table, not Row/Column: those stack on phones, and a
                 signature keeps the face beside the name. -->
            <table role="presentation" cellpadding="0" cellspacing="0" class="mt-8">
              <tr>
                <td class="w-[72px] align-middle">
                  <Img
                    :src="photo"
                    width="56"
                    height="56"
                    alt="Jagrit"
                    class="rounded-full"
                  />
                </td>
                <td class="align-middle">
                  <Text :class="['m-0 text-base leading-6', c.ink]">
                    Jagrit from Paradize
                  </Text>
                </td>
              </tr>
            </table>

            <Section
              :class="['mt-14 border-0 border-t border-solid pt-10 text-center', c.rule]"
            >
              <Text :class="['m-0 text-[13px] leading-5', c.ink]">
                <template v-for="(link, i) in links" :key="link.href">
                  <span v-if="i" :class="['px-3', c.dim]">|</span>
                  <Link :href="link.href" :class="['underline', c.ink]">{{
                    link.text
                  }}</Link>
                </template>
              </Text>
              <Text :class="['m-0 mt-7 text-xs leading-5', c.dim]">
                {{ copyright }}
              </Text>
              <div class="mt-8">
                <Link href="https://paradize.space">
                  <Img :src="mark" width="32" height="32" alt="Paradize" class="rounded-[4px]" />
                </Link>
              </div>
            </Section>
          </Container>
        </Section>
      </NotPlaintext>

      <!-- The text/plain part: see plaintextHtml above. -->
      <Plaintext>
        <div v-html="plaintextHtml"></div>
      </Plaintext>
    </Body>
  </Html>
</template>
