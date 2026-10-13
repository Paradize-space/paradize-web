export type NavItem = {
  href: string;
  label: string;
  /** Section anchors live on the landing page; routes are their own page. */
  kind: "anchor" | "route";
  /** For an anchor: the landing-page sections it stands for, by id, if
   *  more than the one it links to. */
  sections?: string[];
};

/**
 * The three streams, on the left of the header. The platform is the
 * landing page itself: its link goes to the top, where PARADIZE is,
 * and it stays lit through the film that explains it. The other two
 * are pages of their own.
 *
 * Every href is written absolutely. A bare `#route` resolves against
 * whatever page you happen to be on, which silently does nothing from
 * /marketplace.
 */
export const navItems: NavItem[] = [
  {
    href: "/#top",
    label: "Platform",
    kind: "anchor",
    sections: ["top", "route"],
  },
  { href: "/marketplace", label: "Marketplace", kind: "route" },
  { href: "/research", label: "Research", kind: "route" },
];

/** On the right of the header: where the build stands. */
export const utilityItems: NavItem[] = [
  { href: "/#status", label: "Status", kind: "anchor" },
];
