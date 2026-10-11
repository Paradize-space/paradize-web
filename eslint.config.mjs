import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  { ignores: [".next/**", "node_modules/**", "out/**"] },
  {
    // Every email is a Maizzle template in emails/, sent with sendEmail()
    // from lib/emails/send.ts. The mail SDK is allowed in that one file,
    // so nothing can send around it, and Maizzle is a build tool that
    // never ships inside the app.
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    ignores: ["lib/emails/send.ts", "scripts/**", "maizzle.config.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "hostinger-mail-api-sdk",
              message:
                "Send email with sendEmail() from @/lib/emails/send. Each email is a Maizzle template in emails/.",
            },
            {
              name: "@maizzle/framework",
              message:
                "Maizzle runs at build time (npm run emails:build). Send a compiled template with sendEmail() from @/lib/emails/send.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
