import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { readFileSync } from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "http";
import Database from "better-sqlite3";

// ─── SQLite persistent database ──────────────────────────────────────────────
const DB_PATH = path.resolve(import.meta.dirname, "data/game.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS tg_clicker (
    telegram          TEXT PRIMARY KEY,
    score             INTEGER NOT NULL DEFAULT 0,
    last_daily_reward TEXT    NULL
  );

  CREATE TABLE IF NOT EXISTS tg_miners (
    wallet_address TEXT PRIMARY KEY,
    miners         TEXT NOT NULL DEFAULT '[]'
  );
`);

// ─── Prepared statements ──────────────────────────────────────────────────────
const stmts = {
  upsertUser:    db.prepare(`INSERT INTO tg_clicker (telegram, score, last_daily_reward) VALUES (?, 0, NULL) ON CONFLICT(telegram) DO NOTHING`),
  getUser:       db.prepare(`SELECT telegram, score, last_daily_reward FROM tg_clicker WHERE telegram = ?`),
  setScore:      db.prepare(`UPDATE tg_clicker SET score = ? WHERE telegram = ?`),
  setDailyScore: db.prepare(`UPDATE tg_clicker SET score = ?, last_daily_reward = ? WHERE telegram = ?`),
  getMiners:     db.prepare(`SELECT miners FROM tg_miners WHERE wallet_address = ?`),
  upsertMiners:  db.prepare(`INSERT INTO tg_miners (wallet_address, miners) VALUES (?, ?) ON CONFLICT(wallet_address) DO UPDATE SET miners = excluded.miners`),
};

// ─── Miner types ──────────────────────────────────────────────────────────────
interface MinerInstance { isActive: boolean; lastTimeReset: string }
interface MinerGroup    { tokenId: string;   miners: MinerInstance[] }
interface NftMiner      { tokenId: string;   count: number }

const MINERS_STATS: Record<string, number> = {
  "4": 30_000,
  "5": 70_000,
  "6": 150_000,
  "7": 350_000,
};

const DAILY_REWARD      = 5000;
const DAILY_REWARD_TIME = 60 * 60 * 3; // 3 hours in seconds

function syncMiners(existing: MinerGroup[], nftMiners: NftMiner[]): MinerGroup[] {
  const now = new Date().toISOString();
  const result: MinerGroup[] = [];
  for (const nft of nftMiners) {
    if (nft.count === 0) continue;
    const ex = existing.find(g => g.tokenId === nft.tokenId);
    if (ex) {
      if (nft.count < ex.miners.length) {
        result.push({ tokenId: nft.tokenId, miners: ex.miners.slice(0, nft.count) });
      } else if (nft.count > ex.miners.length) {
        const extra = Array.from(
          { length: nft.count - ex.miners.length },
          () => ({ isActive: false, lastTimeReset: now }),
        );
        result.push({ tokenId: nft.tokenId, miners: [...ex.miners, ...extra] });
      } else {
        result.push(ex);
      }
    } else {
      result.push({
        tokenId: nft.tokenId,
        miners: Array.from({ length: nft.count }, () => ({ isActive: false, lastTimeReset: now })),
      });
    }
  }
  return result;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function ok(res: ServerResponse, data: unknown) {
  const body = JSON.stringify({ success: true, data });
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(body);
}
function fail(res: ServerResponse, msg: string, status = 400) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify({ success: false, data: msg }));
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

// ─── Game API Vite plugin ─────────────────────────────────────────────────────
function gameApiPlugin(): Plugin {
  return {
    name: "game-api",
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url   = new URL(req.url ?? "/", "http://localhost");
        const path_ = url.pathname;

        if (req.method === "OPTIONS" && path_.startsWith("/__mockup/api/")) {
          res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          });
          res.end();
          return;
        }

        if (req.method !== "POST" || !path_.startsWith("/__mockup/api/")) {
          return next();
        }

        console.log(`[API] ${req.method} ${path_}`);

        // ── POST /__mockup/api/game-config ──────────────────────────────────
        if (path_ === "/__mockup/api/game-config") {
          try {
            const configPath = path.resolve(import.meta.dirname, "public/miners-config.json");
            const config = JSON.parse(readFileSync(configPath, "utf-8"));
            return ok(res, config);
          } catch {
            return fail(res, "Config read error", 500);
          }
        }

        const body = await readBody(req);
        console.log(`[API] body keys: ${Object.keys(body).join(", ")}`);

        // ── POST /__mockup/api/user ─────────────────────────────────────────
        if (path_ === "/__mockup/api/user") {
          const telegram = String(body.telegram ?? "").trim();
          if (!telegram) return fail(res, "telegram required");

          stmts.upsertUser.run(telegram);
          const row = stmts.getUser.get(telegram) as { telegram: string; score: number; last_daily_reward: string | null };
          return ok(res, {
            telegram:        row.telegram,
            score:           row.score,
            lastDailyReward: row.last_daily_reward,
          });
        }

        // ── POST /__mockup/api/save-score ───────────────────────────────────
        if (path_ === "/__mockup/api/save-score") {
          const telegram = String(body.telegram ?? "").trim();
          const score    = Number(body.score);
          if (!telegram) return fail(res, "telegram required");
          if (isNaN(score) || score < 0) return fail(res, "valid score required");

          stmts.upsertUser.run(telegram);
          stmts.setScore.run(score, telegram);
          return ok(res, { telegram, score });
        }

        // ── POST /__mockup/api/claim-daily ──────────────────────────────────
        if (path_ === "/__mockup/api/claim-daily") {
          const telegram = String(body.telegram ?? "").trim();
          if (!telegram) return fail(res, "telegram required");

          stmts.upsertUser.run(telegram);
          const row = stmts.getUser.get(telegram) as { telegram: string; score: number; last_daily_reward: string | null };

          const now       = Math.floor(Date.now() / 1000);
          const lastMs    = row.last_daily_reward ? Math.floor(new Date(row.last_daily_reward).getTime() / 1000) : 0;
          const elapsed   = now - lastMs;

          if (elapsed < DAILY_REWARD_TIME) {
            const nextClaimIn = DAILY_REWARD_TIME - elapsed;
            return fail(res, JSON.stringify({ nextClaimIn, score: row.score }));
          }

          const newScore = row.score + DAILY_REWARD;
          const nowStr   = new Date().toISOString();
          stmts.setDailyScore.run(newScore, nowStr, telegram);
          return ok(res, { score: newScore, reward: DAILY_REWARD, nextClaimIn: DAILY_REWARD_TIME });
        }

        // ── POST /__mockup/api/miners ───────────────────────────────────────
        if (path_ === "/__mockup/api/miners") {
          const walletAddress = String(body.walletAddress ?? "").trim();
          const nftMinersRaw  = String(body.nftMiners     ?? "-").trim();
          if (!walletAddress) return fail(res, "walletAddress required");

          const row = stmts.getMiners.get(walletAddress) as { miners: string } | undefined;
          const existingMiners: MinerGroup[] = row ? JSON.parse(row.miners) : [];

          if (nftMinersRaw === "-") return ok(res, existingMiners);

          const nftMiners: NftMiner[] = JSON.parse(nftMinersRaw);
          const synced = syncMiners(existingMiners, nftMiners);
          stmts.upsertMiners.run(walletAddress, JSON.stringify(synced));
          return ok(res, synced);
        }

        // ── POST /__mockup/api/set-miner-active ─────────────────────────────
        if (path_ === "/__mockup/api/set-miner-active") {
          const walletAddress = String(body.walletAddress ?? "").trim();
          const minerId       = String(body.minerId       ?? "").trim();
          const minerIndex    = Number(body.minerIndex);
          const active        = body.active === true || body.active === "true";
          if (!walletAddress || !minerId) return fail(res, "walletAddress and minerId required");

          const now      = new Date().toISOString();
          const instance: MinerInstance = { isActive: active, lastTimeReset: now };

          const row    = stmts.getMiners.get(walletAddress) as { miners: string } | undefined;
          const miners: MinerGroup[] = row ? JSON.parse(row.miners) : [];

          let found = false;
          const updated = miners.map(g => {
            if (g.tokenId !== minerId) return g;
            found = true;
            const arr = [...g.miners];
            while (arr.length <= minerIndex) arr.push({ isActive: false, lastTimeReset: now });
            arr[minerIndex] = instance;
            return { ...g, miners: arr };
          });
          if (!found) {
            const arr: MinerInstance[] = [];
            for (let i = 0; i <= minerIndex; i++) {
              arr.push(i === minerIndex ? instance : { isActive: false, lastTimeReset: now });
            }
            updated.push({ tokenId: minerId, miners: arr });
          }
          stmts.upsertMiners.run(walletAddress, JSON.stringify(updated));
          return ok(res, instance);
        }

        // ── POST /__mockup/api/withdrawal-miners ────────────────────────────
        if (path_ === "/__mockup/api/withdrawal-miners") {
          const telegram      = String(body.telegram      ?? "").trim();
          const walletAddress = String(body.walletAddress ?? "").trim();
          const nftMinersRaw  = String(body.nftMiners     ?? "[]");
          if (!telegram || !walletAddress) return fail(res, "telegram and walletAddress required");

          const userRow = stmts.getUser.get(telegram) as { score: number } | undefined;
          if (!userRow) return fail(res, "User not found");

          const minersRow = stmts.getMiners.get(walletAddress) as { miners: string } | undefined;
          if (!minersRow) return ok(res, 0);

          const nftMiners: NftMiner[] = JSON.parse(nftMinersRaw);
          const miners    = syncMiners(JSON.parse(minersRow.miners), nftMiners);
          const now       = new Date();
          let miningScore = 0;

          const updatedMiners = miners.map(group => {
            const gemsPerDay = MINERS_STATS[group.tokenId] ?? 0;
            return {
              ...group,
              miners: group.miners.map(m => {
                if (!m.isActive) return m;
                const elapsed = (now.getTime() - new Date(m.lastTimeReset).getTime()) / 86_400_000;
                miningScore  += Math.floor(gemsPerDay * elapsed);
                return { ...m, lastTimeReset: now.toISOString() };
              }),
            };
          });
          stmts.upsertMiners.run(walletAddress, JSON.stringify(updatedMiners));

          if (miningScore > 0) {
            stmts.setScore.run(userRow.score + miningScore, telegram);
          }
          return ok(res, miningScore);
        }

        next();
      });
    },
  };
}

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const basePath = process.env.BASE_PATH;
if (!basePath) throw new Error("BASE_PATH environment variable is required but was not provided.");

export default defineConfig({
  base: basePath,
  plugins: [
    gameApiPlugin(),
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
