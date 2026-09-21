"use client";

import Image from "next/image";
import { useState } from "react";

import { Reveal } from "@/components/chrome/reveal";
import { Words } from "@/components/chrome/words";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  checkRequirements,
  defaultReleaseId,
  deskSensor,
  statusCopy,
  type RequirementStatus,
} from "@/lib/data/desk-sensor";
import { photos } from "@/lib/photos";

/**
 * A release, and what building it would actually cost you.
 *
 * This is the one part of the page that is not a claim: pick a release
 * and the requirement check recomputes against a fixed sample
 * inventory. Built out of the registry's Tabs, Table and Badge rather
 * than a bespoke widget.
 *
 * Everything shown is the FICTIONAL Desk Sensor fixture in
 * lib/data/desk-sensor.ts. It is labelled as sample data on the surface,
 * not just in a comment.
 */
const statusTone: Record<RequirementStatus, string> = {
  ready: "border-ok/30 bg-ok/10 text-ok",
  missing: "border-gone/35 bg-gone/10 text-gone",
  "in-use": "border-warn/30 bg-warn/10 text-warn",
  "tool-ready": "border-line-2 bg-slab text-mute",
};

export function Platform() {
  const [releaseId, setReleaseId] = useState(defaultReleaseId);

  return (
    <section id="platform" className="px-4 pb-28 sm:px-6 sm:pb-40">
      <div className="mx-auto max-w-page">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <Words
              as="h2"
              className="text-heading max-w-[16ch] text-balance lg:col-span-7"
            >
              {"A release you can still build a year later."}
            </Words>
            <p className="text-small text-mute self-end lg:col-span-4 lg:col-start-9">
              Keep the design, parts list, instructions and firmware tied to a
              specific release. Someone can reproduce that version, or fork it
              and take it somewhere new.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <div className="border-line border-t">
            <div className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <p className="mono text-dim">
                Revision history · {deskSensor.name}
              </p>
              <Badge
                variant="outline"
                className="mono border-line-2 text-dim rounded-none"
              >
                Sample project · not a live account
              </Badge>
            </div>

            <Tabs value={releaseId} onValueChange={setReleaseId}>
              {/* `group-data-horizontal/tabs:h-8` in the registry's list
                  variant out-specifies a plain `h-auto`, which collapses
                  the strip to 32px and lets the panel ride up over it.
                  The override has to use the same group variant. */}
              <TabsList className="grid w-full grid-cols-1 gap-px rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto sm:grid-cols-3">
                {deskSensor.releases.map((r) => (
                  <TabsTrigger
                    key={r.id}
                    value={r.id}
                    className="border-line data-[selected]:border-fg data-[selected]:bg-slab flex h-auto flex-col items-start gap-1 rounded-none border-t-2 px-4 py-4 text-left"
                  >
                    <span className="mono text-dim">
                      {r.isLatest ? "Current" : r.standing}
                    </span>
                    <span className="text-sub">{r.name}</span>
                    <span className="data text-mute">
                      {r.hardwareRevision} · {r.firmwareVersion}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {deskSensor.releases.map((r) => {
                // Counted per release, not from the selected one: each tab
                // panel has to state its own figure or the number goes stale
                // the moment the panels are rendered together.
                const checks = checkRequirements(r);
                const missing = checks.filter(
                  (c) => c.item.kind === "component" && c.status === "missing",
                ).length;

                return (
                  <TabsContent
                    key={r.id}
                    value={r.id}
                    className="mt-10 [animation:panel-in_420ms_cubic-bezier(0.22,0.7,0.25,1)_both]"
                  >
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
                      <div className="lg:col-span-5">
                        <div className="bg-slab relative aspect-4/3 overflow-hidden">
                          <Image
                            src={photos.boardMono.src}
                            alt={photos.boardMono.alt}
                            fill
                            sizes="(min-width: 1024px) 40vw, 92vw"
                            className="photo parallax object-cover opacity-60"
                          />
                          <p className="mono text-fg absolute bottom-3 left-3">
                            Illustrative photograph — not the sample project
                          </p>
                        </div>

                        <p className="mono text-dim mt-8">Release note</p>
                        <p className="text-small mt-3 max-w-[44ch]">{r.note}</p>

                        <p className="mono text-dim mt-8">
                          Changed in this release
                        </p>
                        <ul className="ruled mt-3">
                          {r.changes.map((change) => (
                            <li
                              key={change}
                              className="text-small text-mute py-3"
                            >
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <p className="mono text-dim">
                            Requirement check · {r.name}
                          </p>
                          <p className="mono text-mute">
                            {missing === 0
                              ? "Nothing to source"
                              : `${missing} line${missing === 1 ? "" : "s"} to source`}
                          </p>
                        </div>

                        {/* table-fixed, or the long allocation note gives the
                          table a min-content width well past its column and
                          the container scrolls sideways. */}
                        <Table className="mt-3 table-fixed">
                          <TableHeader>
                            <TableRow className="border-line hover:bg-transparent">
                              <TableHead className="mono text-dim h-auto py-3">
                                Item
                              </TableHead>
                              <TableHead className="mono text-dim h-auto w-14 py-3 text-right">
                                Req
                              </TableHead>
                              <TableHead className="mono text-dim h-auto w-28 py-3 text-right">
                                State
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {checks.map((check) => (
                              <TableRow
                                key={check.item.id}
                                className="border-line hover:bg-slab/60"
                              >
                                <TableCell className="py-4 align-top whitespace-normal">
                                  <span className="data text-dim block">
                                    {check.item.ref}
                                  </span>
                                  <span className="mt-1 block">
                                    {check.item.name}
                                  </span>
                                  <span className="text-small text-mute mt-1 block">
                                    {check.holding}
                                  </span>
                                  {check.item.allocation ? (
                                    <span className="border-warn/50 text-small text-mute mt-2 block border-l-2 pl-3">
                                      In {check.item.allocation.build} —{" "}
                                      {check.item.allocation.note}
                                    </span>
                                  ) : null}
                                </TableCell>
                                <TableCell className="data py-4 text-right align-top">
                                  {check.item.kind === "tool"
                                    ? "—"
                                    : check.required}
                                </TableCell>
                                <TableCell className="py-4 text-right align-top">
                                  <Badge
                                    variant="outline"
                                    className={`mono rounded-none ${statusTone[check.status]}`}
                                  >
                                    {statusCopy[check.status].label}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <p className="text-small text-mute mt-6 max-w-[56ch]">
                          A check only reads your inventory. It will not pull a
                          part out of a build you have already assembled.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
