export type NavItem = {
  href: string;
  label: string;
  /** Section anchors live on the landing page; routes are their own page. */
  kind: "anchor" | "route";
};

/**
 * Two of these are sections of the landing page and two are pages of
 * their own, so every href is written absolutely. A bare `#platform`
 * resolves against whatever page you happen to be on, which silently
 * does nothing from /marketplace.
 */
export const navItems: NavItem[] = [
  { href: "/#route", label: "How it works", kind: "anchor" },
  { href: "/#platform", label: "Platform", kind: "anchor" },
  { href: "/marketplace", label: "Marketplace", kind: "route" },
  { href: "/research", label: "Research", kind: "route" },
];
