/**
 * Photographs the marketplace's products for the page.
 *
 *   PW=<path to playwright> node tools/part-shots/render.cjs [id ...]
 *
 * Bundles main.ts with esbuild, opens it in Chromium on the machine's
 * GPU, and writes each shot to public/market/parts/<id>.webp with a
 * transparent background. With no ids, shoots them all.
 */
const esbuild = require("esbuild");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");

const here = __dirname;
const out = path.join(here, ".out");
const dest = path.join(here, "../../public/market/parts");

const SHOTS = {
  controller: [640, 480],
  switches: [640, 480],
  keycaps: [640, 480],
  plate: [640, 480],
  screws: [640, 480],
  encoder: [640, 480],
  knob: [640, 480],
};

(async () => {
  const wanted = process.argv.slice(2).length
    ? process.argv.slice(2)
    : Object.keys(SHOTS);
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(dest, { recursive: true });
  await esbuild.build({
    entryPoints: [path.join(here, "main.ts")],
    bundle: true,
    format: "iife",
    outfile: path.join(out, "bundle.js"),
    tsconfig: path.join(here, "../../tsconfig.json"),
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "warning",
  });
  fs.copyFileSync(path.join(here, "index.html"), path.join(out, "index.html"));

  const server = http
    .createServer((req, res) => {
      const file = path.join(
        out,
        req.url === "/" ? "index.html" : req.url.slice(1),
      );
      if (!file.startsWith(out) || !fs.existsSync(file))
        return res.writeHead(404).end();
      res.writeHead(200, {
        "content-type": file.endsWith(".js") ? "text/javascript" : "text/html",
      });
      fs.createReadStream(file).pipe(res);
    })
    .listen(4174);

  const browser = await chromium.launch({
    args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage();
  page.on("pageerror", (e) =>
    console.log("pageerror:", String(e).slice(0, 400)),
  );
  await page.goto("http://localhost:4174/");
  for (const id of wanted) {
    const [width, height] = SHOTS[id];
    const url = await page.evaluate((s) => window.__shoot(s), {
      id,
      width,
      height,
    });
    const file = path.join(dest, `${id}.webp`);
    fs.writeFileSync(file, Buffer.from(url.split(",")[1], "base64"));
    console.log(
      "wrote",
      path.relative(process.cwd(), file),
      fs.statSync(file).size,
      "bytes",
    );
  }
  await browser.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
