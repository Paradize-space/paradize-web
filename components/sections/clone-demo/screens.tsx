"use client";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  demoProfile,
  listings,
  marketQuery,
  partPhotos,
  type Listing,
} from "@/lib/data/demo-market";
import { order, type Phase } from "@/lib/data/demo-flow";
import {
  deskSensor,
  statusCopy,
  type CheckedRequirement,
  type Release,
} from "@/lib/data/desk-sensor";
import { statusTone } from "@/lib/status-tone";
import { cn } from "@/lib/utils";

import type { SetMark } from "./camera";

/**
 * The three screens the preview moves between.
 *
 * One component each, rather than three ternaries nested inside the
 * player. Each is handed only the marks it owns — the handles the
 * camera aims at — so a screen cannot reach for something that is not
 * on it, and a change to the listing card cannot break the parts
 * list.
 *
 * Everything they show comes from the same fixtures the rest of the
 * site uses, so the preview cannot show a result the real check would
 * not.
 */

export function ProfileScreen({
  at,
  setProjectRow,
}: {
  at: number;
  setProjectRow: SetMark;
}) {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7">
      <div className="flex items-center gap-4">
        <span className="border-line-2 bg-ghost text-dim mono flex size-12 shrink-0 items-center justify-center border">
          DW
        </span>
        <span className="min-w-0">
          <span className="text-sub block">{demoProfile.handle}</span>
          <span className="text-small text-mute mt-0.5 block">
            {demoProfile.bio}
          </span>
        </span>
      </div>

      <p className="mono text-dim mt-7">
        Projects · sample profile, not a real account
      </p>

      <ul className="ruled mt-2">
        {demoProfile.projects.map((p) => (
          <li key={p.name}>
            <div
              ref={p.current ? setProjectRow : undefined}
              className={cn(
                "flex items-center justify-between gap-4 px-2 py-3.5 transition-colors duration-300",
                p.current && at >= order("open")
                  ? "bg-ghost"
                  : "bg-transparent",
              )}
            >
              <span className="min-w-0">
                <span className="text-small block">{p.name}</span>
                <span className="data text-dim mt-0.5 block">{p.release}</span>
              </span>
              <span className="mono text-dim shrink-0">Open</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectScreen({
  release,
  lines,
  cloned,
  checked,
  phase,
  setClone,
  setList,
  setShortfall,
}: {
  release: Release;
  lines: CheckedRequirement[];
  cloned: boolean;
  checked: boolean;
  phase: Phase;
  setClone: SetMark;
  setList: SetMark;
  setShortfall: SetMark;
}) {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono text-dim">
            {release.name} · {release.hardwareRevision} ·{" "}
            {release.firmwareVersion}
          </p>
          <p className="text-sub mt-1">{deskSensor.name}</p>
          <p className="text-small text-mute mt-1.5 line-clamp-2 max-w-[42ch]">
            {deskSensor.summary}
          </p>
        </div>
        <button
          ref={setClone}
          type="button"
          tabIndex={-1}
          className={cn(
            "mono shrink-0 border px-4 py-2 transition-colors duration-200",
            cloned ? "border-line-2 text-dim" : "border-fg bg-fg text-bg",
            phase === "clone" && "scale-[0.97]",
          )}
        >
          {cloned ? "Cloned" : "Clone this release"}
        </button>
      </div>

      {/* The parts list belongs to the release, so the rows are there
          from the first frame. Only the STATE resolves — hiding the
          rows left the window holding a large empty space, and
          implied the list itself arrives from somewhere. */}
      <p className="mono text-dim mt-6">
        Apparatus · {lines.length} components
      </p>
      <ul ref={setList} className="ruled mt-1">
        {lines.map((line, i) => {
          const isMissing = line.status === "missing";
          const photo = partPhotos[line.item.id];
          const delay = `${i * 150}ms`;
          return (
            <li
              key={line.item.id}
              className={cn(
                "-ml-3 flex items-center gap-3 border-l-2 py-2 pl-3 transition-colors duration-500",
                // The one row the whole flow turns on. Marked once the
                // check has run, so the eye has somewhere to go on a
                // wide beat.
                isMissing && checked ? "border-gone/40" : "border-transparent",
              )}
            >
              {photo ? (
                <span className="bg-ghost border-line relative size-10 shrink-0 overflow-hidden border">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="40px"
                    className="photo-part object-cover"
                  />
                </span>
              ) : null}

              <span className="min-w-0 flex-1">
                <span className="data text-dim block">{line.item.ref}</span>
                <span className="text-small mt-0.5 block truncate">
                  {line.item.name}
                </span>
              </span>

              <span className="relative inline-flex shrink-0 items-center justify-end">
                {/* Placeholder and badge share one cell, so nothing
                    reflows as it lands. */}
                <span
                  className={cn(
                    "mono text-dim transition-opacity duration-300",
                    checked ? "opacity-0" : "opacity-100",
                  )}
                >
                  Not checked
                </span>
                <Badge
                  variant="outline"
                  style={{ transitionDelay: checked ? delay : "0ms" }}
                  className={cn(
                    "mono absolute right-0 rounded-none transition-opacity duration-300",
                    statusTone[line.status],
                    checked ? "opacity-100" : "opacity-0",
                  )}
                >
                  {statusCopy[line.status].label}
                </Badge>
              </span>
            </li>
          );
        })}
      </ul>

      <p
        ref={setShortfall}
        className={cn(
          "mono mt-4 transition-opacity duration-500",
          checked ? "text-warn opacity-100" : "opacity-0",
        )}
      >
        1 line to source → parts
      </p>
    </div>
  );
}

export function MarketScreen({
  at,
  shown,
  inCart,
  phase,
  pick,
  missingRef,
  setSearch,
  setResults,
  setAdd,
}: {
  at: number;
  /** Characters of the query typed in so far. */
  shown: number;
  inCart: boolean;
  phase: Phase;
  pick: Listing;
  missingRef?: string;
  setSearch: SetMark;
  setResults: SetMark;
  setAdd: SetMark;
}) {
  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div
        ref={setSearch}
        className={cn(
          "flex items-center gap-3 border px-3 py-2.5 transition-colors duration-300",
          at === order("search")
            ? "border-fg bg-ghost"
            : "border-line-2 bg-transparent",
        )}
      >
        <span className="mono text-dim shrink-0">Find</span>
        <span className="mono text-fg min-w-0 flex-1 truncate">
          {marketQuery.slice(0, shown)}
          {shown < marketQuery.length ? (
            <span className="bg-fg ml-px inline-block h-3 w-1.5 align-middle" />
          ) : null}
        </span>
        <span className="mono text-dim hidden shrink-0 sm:block">
          for {missingRef}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="mono text-dim">{listings.length} results</p>
        <p className="mono text-dim truncate">No supplier connected</p>
      </div>

      {/* Cards, not rows. A full-width row puts the Add button ~900px
          from the photograph it belongs to, so pushing the camera into
          either one loses the other entirely. A card keeps the
          picture, the part and the action inside 300px, which is a
          frame worth zooming into — and it is how a parts marketplace
          lays results out anyway. */}
      <ul
        ref={setResults}
        className="mt-2 flex items-stretch gap-3 overflow-hidden"
      >
        {listings.map((l, i) => {
          const isPick = l.id === pick.id;
          return (
            <li
              key={l.id}
              style={{ animationDelay: `${i * 90}ms` }}
              className={cn(
                "flex w-[46%] shrink-0 flex-col border p-2 transition-colors duration-500 sm:w-[31.8%]",
                "[animation:reveal-rise_460ms_cubic-bezier(0.22,0.7,0.25,1)_both]",
                isPick ? "border-line-2" : "border-line",
              )}
            >
              <span className="bg-ghost border-line relative block aspect-4/3 overflow-hidden border">
                <Image
                  src={l.photo}
                  alt={l.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, 45vw"
                  className="photo-part object-cover"
                />
              </span>

              <span className="text-small mt-2 block leading-tight">
                {l.title}
              </span>
              <span className="data text-dim mt-1 block truncate">
                {l.spec}
              </span>
              <span
                className={cn(
                  "mono mt-1.5 block",
                  isPick ? "text-ok" : "text-dim",
                )}
              >
                {isPick ? `Fits ${missingRef}` : "Partial fit"}
              </span>

              <span className="border-line mt-2 flex items-center justify-between gap-2 border-t pt-2">
                {/* A listing card wants a price here. There is not one
                    — no supplier is connected — so the slot says so
                    rather than carrying a number that would have to be
                    invented. */}
                <span className="mono text-dim">No price</span>
                {isPick ? (
                  <button
                    ref={setAdd}
                    type="button"
                    tabIndex={-1}
                    className={cn(
                      "mono border px-3 py-1 transition-all duration-300",
                      inCart
                        ? "border-ok/40 text-ok"
                        : "border-fg bg-fg text-bg",
                      phase === "add" && "scale-[0.97]",
                    )}
                  >
                    {inCart ? "In cart" : "Add"}
                  </button>
                ) : (
                  <span className="mono text-dim border border-transparent px-3 py-1">
                    Add
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mono text-dim mt-4">
        Stock photographs of real components. Not products Paradize sells.
      </p>
    </div>
  );
}
