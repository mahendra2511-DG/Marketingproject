/**
 * AXon Marketing Analytics — Project Schedule live sync (Vercel serverless function)
 * URL on your site: /api/schedule
 *
 * Storage: Upstash Redis (free) connected from the Vercel dashboard → Storage / Marketplace.
 * Connecting it adds KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) automatically.
 *
 * Trainer PIN:
 *   - Optional env var ADMIN_PIN = your starting PIN (default "excelr2026").
 *   - After you change the PIN from the website, its hash is stored in Redis and ADMIN_PIN is ignored.
 *   - The PIN is checked HERE on the server; it never appears in the website code.
 *   - 8 wrong PINs within 15 minutes locks saving for 15 minutes (protects against guessing).
 *
 * GET  /api/schedule                        → schedule JSON (everyone)
 * POST /api/schedule {action:"check",pin}   → {ok}
 * POST /api/schedule {action:"save",pin,data}
 * POST /api/schedule {action:"setpin",pin,newPin}
 */
const crypto = require("crypto");

const KEY_DATA = "axon:mkt:schedule", KEY_PIN = "axon:mkt:pinhash", KEY_FAIL = "axon:mkt:pinfail";
const MAX_FAILS = 8, FAIL_WINDOW_S = 900, MAX_BYTES = 200000;

function redisEnv() {
  const e = process.env;
  let url = e.KV_REST_API_URL || e.UPSTASH_REDIS_REST_URL, token = e.KV_REST_API_TOKEN || e.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {                                   // custom prefix chosen in Vercel (e.g. STORAGE_REST_API_URL)
    const k = Object.keys(e).find(k => /_REST_API_URL$/.test(k) && e[k.replace(/_URL$/, "_TOKEN")]);
    if (k) { url = e[k]; token = e[k.replace(/_URL$/, "_TOKEN")]; }
  }
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}
async function redis(env, ...cmd) {
  const r = await fetch(env.url, { method: "POST", headers: { Authorization: "Bearer " + env.token, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const hash = (pin) => crypto.createHash("sha256").update("axon-mkt-trainer|" + pin, "utf8").digest("hex");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.end(JSON.stringify(obj));
}
async function readBody(req) {
  if (req.body !== undefined && req.body !== null && req.body !== "") return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString("utf8");
  return s ? JSON.parse(s) : {};
}

module.exports = async function handler(req, res) {
  const env = redisEnv();
  if (!env) return send(res, 200, { configured: false, error: "Database not connected. Vercel → Storage → connect Upstash Redis, then redeploy." });
  try {
    if (req.method === "GET") {
      const v = await redis(env, "GET", KEY_DATA);
      return send(res, 200, v ? JSON.parse(v) : { active: "", projects: [] });
    }
    if (req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed" });

    let b; try { b = await readBody(req); } catch (e) { return send(res, 400, { ok: false, error: "Bad request" }); }
    const fails = +(await redis(env, "GET", KEY_FAIL)) || 0;
    if (fails >= MAX_FAILS) return send(res, 429, { ok: false, error: "Too many wrong PINs. Try again in 15 minutes." });

    const stored = (await redis(env, "GET", KEY_PIN)) || hash(process.env.ADMIN_PIN || "excelr2026");
    if (hash(String(b.pin || "")) !== stored) {
      await redis(env, "INCR", KEY_FAIL); await redis(env, "EXPIRE", KEY_FAIL, FAIL_WINDOW_S);
      await sleep(800);
      return send(res, 401, { ok: false, error: "Wrong PIN" });
    }
    if (fails) await redis(env, "DEL", KEY_FAIL);

    if (b.action === "check") return send(res, 200, { ok: true });
    if (b.action === "save") {
      const d = b.data;
      if (!d || !Array.isArray(d.projects)) return send(res, 400, { ok: false, error: "Bad data" });
      delete d.pinHash;                                    // PIN never stored with the public data
      const s = JSON.stringify(d);
      if (s.length > MAX_BYTES) return send(res, 413, { ok: false, error: "Too much data: delete old projects first" });
      await redis(env, "SET", KEY_DATA, s);
      return send(res, 200, { ok: true, saved: new Date().toISOString() });
    }
    if (b.action === "setpin") {
      const n = String(b.newPin || "");
      if (n.length < 4) return send(res, 400, { ok: false, error: "PIN must be at least 4 characters" });
      await redis(env, "SET", KEY_PIN, hash(n));
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { ok: false, error: "Unknown action" });
  } catch (e) {
    return send(res, 500, { ok: false, error: "Server error: " + e.message });
  }
};
