import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        /*
         * Paradize's own controls, measured from the reference
         * (oxiinstruments.com) rather than eyeballed. All three share its
         * 4px corner, Work Sans at 400, tight negative tracking and a
         * slow 0.4s settle; none of them changes colour on hover.
         */
        // Header pill: frosted glass over whatever passes beneath. Hover
        // dims the label a little and softens it, rather than lighting
        // the pill up; the label always stays readable. (The softening
        // is a text shadow, not a filter: a filter on the pill breaks
        // its frosted backdrop into a pale box spilling out round it.)
        pill: "rounded-[4px] bg-fg/10 font-normal tracking-[-0.04em] text-fg backdrop-blur-[6px] [text-shadow:0_0_0_rgb(241_241_241/0)] transition-[color,text-shadow] duration-400 hover:text-fg/75 hover:[text-shadow:0_0_1px_rgb(241_241_241/0.5)] aria-expanded:bg-fg/15",
        // The light action: the one thing to do next in a section.
        action:
          "rounded-[4px] bg-fg font-normal tracking-[-0.02em] text-bg uppercase transition-opacity duration-400 hover:opacity-80",
        // Ink on a light card: fills in black, hollows out on hover.
        ink: "rounded-[4px] border-bg bg-bg font-normal tracking-[-0.04em] text-fg uppercase transition-colors duration-400 hover:bg-transparent hover:text-bg",
        // The same, for a dark ground: hollow white, fills on hover.
        line: "rounded-[4px] border-fg/80 bg-transparent font-normal tracking-[-0.04em] text-fg uppercase transition-colors duration-400 hover:bg-fg hover:text-bg",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        // Reference sizes: header pills 36px, actions 46px, card buttons 44px.
        pill: "h-9 gap-3 px-3 text-[0.72rem]",
        action: "h-[2.875rem] gap-5 px-8 text-[0.675rem]",
        card: "h-11 w-full px-4 text-[0.765rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
