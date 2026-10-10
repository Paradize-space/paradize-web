<script setup lang="ts">
/**
 * The one email a waitlist signup gets.
 *
 * It repeats what the person just saw on the page: the form's "Saved"
 * panel, then the early-access promise in the site's own words. Colours
 * and type are the site's tokens (app/globals.css), declared in @theme
 * below so the classes read the same as the site's.
 *
 * `subject` is read by scripts/build-emails.mjs, so the subject line
 * lives with the email it belongs to.
 */
defineConfig({
  subject: "You are on the list",
})
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

        @theme {
          --color-ground: #010101;
          --color-ink: #f1f1f1;
          --color-mute: #8a8a8a;
          --color-dim: #787878;
          --color-line: #1c1c1e;
          --color-line-2: #2f2f33;
          --color-slab: #0c0c0f;
          --color-ok: #6ee07a;
          --font-sans: "Work Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          --font-mono: "Fragment Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
        }
      </style>
    </Head>

    <Font family="Work Sans" :weights="[400, 500]" />
    <Font family="Fragment Mono" />

    <Body class="m-0 bg-ground p-0">
      <NotPlaintext>
        <!-- The inbox preview line. The filler keeps the body text from
             spilling into the preview after it. -->
        <div class="hidden max-h-0 overflow-hidden">
          We will write when there is something real to show.<template
            v-for="i in 60"
            :key="i"
            >&#8199;&#65279;&#847; </template
          >
        </div>

        <Section class="w-full bg-ground">
          <Container class="max-w-150 px-6 py-12 font-sans text-ink">
            <Section class="pb-10">
              <Link
                href="https://paradize.space"
                class="text-[17px] leading-none tracking-[0.34em] uppercase text-ink no-underline"
              >
                Paradize
              </Link>
            </Section>

            <Section class="border border-solid border-line-2 bg-slab px-8 py-10">
              <Text class="m-0 font-mono text-[11px] leading-4 tracking-[0.08em] uppercase text-ok">
                Saved
              </Text>
              <Heading
                class="mt-4 mb-0 font-sans text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-ink"
              >
                You are on the list.
              </Heading>
              <Text class="mt-5 mb-0 text-base leading-6 text-mute">
                We will write when there is something real to show, and when
                early builders can start shaping how it works.
              </Text>
            </Section>

            <Section class="pt-10">
              <Text class="m-0 text-base leading-6 text-ink">
                Paradize is a home for hardware projects: documented once,
                versioned as they change, and reproducible by someone else.
              </Text>

              <Spacer class="h-8" />

              <Button
                href="https://paradize.space"
                class="rounded-[6px] bg-ink px-6 py-3 font-mono text-[11px] leading-4 tracking-[0.08em] uppercase text-ground"
              >
                Visit paradize.space
              </Button>
            </Section>

            <Section class="mt-12 border-0 border-t border-solid border-line pt-6">
              <Text class="m-0 font-mono text-[11px] leading-4 tracking-[0.08em] uppercase text-dim">
                Paradize is in development
              </Text>
              <Text class="mt-3 mb-0 text-xs leading-5 text-dim">
                This address was entered on paradize.space. If that was not
                you, reply to this email and we will remove it.
              </Text>
            </Section>
          </Container>
        </Section>
      </NotPlaintext>

      <!-- The text/plain part, written out rather than derived, so it
           reads as a letter and not as stripped markup. Plaintext
           conversion collapses repeated <br>s, so each blank line
           between paragraphs is a <br>, an &nbsp; and a <br>. -->
      <Plaintext>
        You are on the list.<br />
        &nbsp;<br />
        We will write when there is something real to show, and when early
        builders can start shaping how it works.<br />
        &nbsp;<br />
        Paradize is a home for hardware projects: documented once, versioned
        as they change, and reproducible by someone else.<br />
        &nbsp;<br />
        https://paradize.space<br />
        &nbsp;<br />
        --<br />
        Paradize is in development.<br />
        This address was entered on paradize.space. If that was not you,
        reply to this email and we will remove it.
      </Plaintext>
    </Body>
  </Html>
</template>
