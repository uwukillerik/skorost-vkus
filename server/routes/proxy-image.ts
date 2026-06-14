import { Router } from "express";

const router = Router();

const ALLOWED_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "skorostivkus.ru",
  "77.50.193.34",
]);

router.get("/", async (req, res) => {
  const raw = req.query.url;
  if (typeof raw !== "string" || !raw.trim()) {
    res.status(400).json({ error: "url required" });
    return;
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    res.status(400).json({ error: "invalid url" });
    return;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    res.status(400).json({ error: "invalid protocol" });
    return;
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    res.status(403).json({ error: "host not allowed" });
    return;
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(15_000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch {
    res.status(502).json({ error: "image fetch failed" });
  }
});

export default router;
