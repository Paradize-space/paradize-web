import { createCn } from "cn/config";

/**
 * Class merging that knows the site's own type scale.
 *
 * Out of the box the merger only knows Tailwind's sizes, so it reads
 * `text-heading` as a colour, and `cn("text-heading", "text-mute")`
 * keeps the colour and silently drops the size. Registering the scale
 * from app/globals.css fixes that everywhere at once.
 *
 * Registry components import `cn` from here, not from the "cn" package
 * directly; `shadcn add` writes the package import, so change it when
 * adding one.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "monument",
            "display",
            "statement",
            "heading",
            "sub",
            "lead",
            "body",
            "small",
            "micro",
          ],
        },
      ],
    },
  },
});
