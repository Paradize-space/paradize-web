<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Email is Maizzle only

Every email this site sends is a Maizzle template in `emails/*.vue`, compiled by `npm run emails:build` into `lib/emails/generated.ts` and sent with `sendEmail(to, name)` from `lib/emails/send.ts`. Never write email HTML or text by hand, never edit `lib/emails/generated.ts`, and never import `hostinger-mail-api-sdk` or `@maizzle/framework` elsewhere; ESLint rejects both. To add or change an email, edit or add a template and read "Email" in `docs/DEVELOPMENT.md` first.
