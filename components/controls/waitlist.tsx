"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { VariantProps } from "class-variance-authority";

import { WaitlistForm } from "@/components/sections/waitlist-form";
import type { WaitlistInterest } from "@/lib/waitlist/signup";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The waitlist, reachable from anywhere without leaving the page.
 *
 * Every "Join the waitlist" control on the site opens the same panel,
 * which slides in over whatever you were reading and holds the same
 * form as the foot of the page. One panel, mounted once in the layout,
 * so the header, the floating card and the mobile menu cannot drift
 * apart. Each trigger is also a real link to the form at the foot of
 * the home page, so it still goes somewhere without JavaScript.
 */

type Open = (interests?: WaitlistInterest[]) => void;

const WaitlistContext = createContext<{ open: Open } | null>(null);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // What to tick when the panel opens; a new key remounts the form so
  // it starts from these.
  const [preset, setPreset] = useState<{
    key: number;
    interests: WaitlistInterest[];
  }>({ key: 0, interests: [] });
  const value = useMemo<{ open: Open }>(
    () => ({
      open: (interests = []) => {
        setPreset((p) => ({ key: p.key + 1, interests }));
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="border-line bg-bg text-fg w-full gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-[28rem]"
        >
          <div className="flex items-center justify-between px-6 pt-5">
            <p className="mono text-dim">Paradize is pre-launch</p>
            <SheetClose
              render={<Button variant="pill" size="pill" />}
              className="gap-2"
            >
              Close
              <XIcon aria-hidden="true" className="size-3.5" />
            </SheetClose>
          </div>

          <div className="px-6 pt-14 pb-8">
            <SheetTitle className="text-heading text-fg font-normal">
              Join the waitlist
            </SheetTitle>
            <SheetDescription className="text-small text-mute mt-4 max-w-[36ch]">
              We will write when there is something real to show, and when early
              builders can start shaping how it works.
            </SheetDescription>
          </div>

          <div className="border-line border-t px-6 py-8">
            <WaitlistForm
              key={preset.key}
              framed={false}
              initialInterests={preset.interests}
            />
          </div>
        </SheetContent>
      </Sheet>
    </WaitlistContext.Provider>
  );
}

/**
 * A control that opens the waitlist panel. Takes the same variants as
 * any other button, so it can be a header pill, a card button or a bar.
 */
export function WaitlistButton({
  variant,
  size,
  className,
  onClick,
  interests,
  children = "Join the waitlist",
}: VariantProps<typeof buttonVariants> & {
  className?: string;
  /** Runs before the panel opens, e.g. to close a menu. */
  onClick?: () => void;
  /** Interests to tick when the panel opens. */
  interests?: WaitlistInterest[];
  children?: ReactNode;
}) {
  const waitlist = useContext(WaitlistContext);
  return (
    <Button
      render={<Link href="/#early-access" />}
      nativeButton={false}
      variant={variant}
      size={size}
      className={className}
      onClick={(event) => {
        if (!waitlist) return;
        event.preventDefault();
        onClick?.();
        waitlist.open(interests);
      }}
    >
      {children}
    </Button>
  );
}
