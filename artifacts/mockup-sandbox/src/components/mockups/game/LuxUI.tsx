import { useState, useEffect, useRef, useCallback } from "react";

/* ─── CSS KEYFRAMES INJECTED ─────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

* { box-sizing: border-box; }

@keyframes blob-drift {
  0%   { transform: translate(0px, 0px) scale(1) rotate(0deg); }
  33%  { transform: translate(60px,-40px) scale(1.15) rotate(120deg); }
  66%  { transform: translate(-30px, 50px) scale(0.9) rotate(240deg); }
  100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
}
@keyframes blob-drift2 {
  0%   { transform: translate(0px,0px) scale(1); }
  50%  { transform: translate(-80px, 60px) scale(1.2); }
  100% { transform: translate(0px, 0px) scale(1); }
}
@keyframes gem-float {
  0%, 100% { transform: translateY(0px) scale(1); filter: brightness(1); }
  50%       { transform: translateY(-12px) scale(1.03); filter: brightness(1.2); }
}
@keyframes gem-tap {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.88); }
  70%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes neon-pulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes ring-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes ring-spin-rev {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
@keyframes score-pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); color: #00fff7; }
  100% { transform: scale(1); }
}
@keyframes fly-up {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-80px); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bar-fill {
  from { width: 0%; }
  to   { width: var(--fill); }
}
@keyframes card-hover {
  from { transform: translateY(0) scale(1); }
  to   { transform: translateY(-4px) scale(1.01); }
}
.lux-root { font-family: 'Inter', system-ui, sans-serif; }
.glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.08);
}
.glass-strong {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px) saturate(200%);
  border: 1px solid rgba(255,255,255,0.12);
}
.neon-text-blue  { text-shadow: 0 0 12px #00d4ff, 0 0 30px #00d4ff88; }
.neon-text-gold  { text-shadow: 0 0 14px #ffd700, 0 0 35px #ffd70066; }
.neon-text-cyan  { text-shadow: 0 0 12px #00fff7, 0 0 28px #00fff766; }
.neon-text-purple{ text-shadow: 0 0 12px #c77dff, 0 0 30px #c77dff66; }
.shimmer-text {
  background: linear-gradient(90deg, #c9a227 0%, #fff8dc 25%, #ffd700 50%, #fff8dc 75%, #c9a227 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
.lux-btn {
  background: linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.2) 100%);
  border: 1px solid rgba(0,212,255,0.35);
  box-shadow: 0 0 20px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.2s;
  cursor: pointer;
}
.lux-btn:hover {
  background: linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(124,58,237,0.35) 100%);
  box-shadow: 0 0 35px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-1px);
}
.lux-btn:active { transform: scale(0.97); }
.gem-container { animation: gem-float 3.5s ease-in-out infinite; }
.gem-container.tapped { animation: gem-tap 0.35s ease forwards !important; }
.tab-active {
  background: linear-gradient(135deg, rgba(0,212,255,0.18), rgba(124,58,237,0.22));
  border: 1px solid rgba(0,212,255,0.4);
  box-shadow: 0 0 18px rgba(0,212,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
}
.slide-in { animation: slide-in 0.3s ease both; }
`;

function useStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);
}

/* ─── ANIMATED BACKGROUND ───────────────────────────────────── */
function LuxBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 20% 20%, #0d1f3c 0%, #02060f 60%, #000208 100%)",
      }} />
      {/* Blob 1 — cyan */}
      <div style={{
        position: "absolute", width: 700, height: 700,
        top: "-15%", left: "-10%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,255,0.13) 0%, transparent 70%)",
        animation: "blob-drift 18s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      {/* Blob 2 — purple */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        bottom: "-10%", right: "5%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
        animation: "blob-drift2 14s ease-in-out infinite",
        filter: "blur(50px)",
      }} />
      {/* Blob 3 — gold */}
      <div style={{
        position: "absolute", width: 400, height: 400,
        top: "40%", left: "55%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,180,0,0.08) 0%, transparent 70%)",
        animation: "blob-drift 22s ease-in-out infinite reverse",
        filter: "blur(35px)",
      }} />
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />
    </div>
  );
}

/* ─── FLY TEXT ───────────────────────────────────────────────── */
function FlyText({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <div key={id} style={{
      position: "absolute", left: x - 15, top: y - 30,
      color: "#00fff7", fontWeight: 800, fontSize: 22,
      pointerEvents: "none", zIndex: 50,
      animation: "fly-up 0.9s ease forwards",
      textShadow: "0 0 14px #00fff7",
    }}>
      +1 💎
    </div>
  );
}

/* ─── PHONE SHELL ────────────────────────────────────────────── */
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 390, height: 840,
      borderRadius: 44,
      overflow: "hidden",
      position: "relative",
      border: "1.5px solid rgba(0,212,255,0.2)",
      boxShadow: [
        "0 0 0 1px rgba(0,0,0,0.8)",
        "0 0 60px rgba(0,212,255,0.15)",
        "0 0 120px rgba(124,58,237,0.1)",
        "0 40px 80px rgba(0,0,0,0.8)",
      ].join(","),
    }}>
      <LuxBg />
      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────── */
type Tab = "home" | "mining" | "tasks" | "profile";
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home",    icon: "◈", label: "Home" },
  { id: "mining",  icon: "⬡", label: "Mining" },
  { id: "tasks",   icon: "◉", label: "Tasks" },
  { id: "profile", icon: "◎", label: "Profile" },
];

function Nav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="glass" style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "10px 12px 18px",
      borderTop: "1px solid rgba(0,212,255,0.12)",
      display: "flex", justifyContent: "space-around",
    }}>
      {TABS.map(({ id, icon, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, cursor: "pointer", background: "none", border: "none",
            padding: "8px 14px", borderRadius: 16,
            transition: "all 0.2s",
            ...(active ? {
              background: "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.15))",
              border: "1px solid rgba(0,212,255,0.25)",
              boxShadow: "0 0 20px rgba(0,212,255,0.15)",
            } : {}),
          }}>
            <span style={{
              fontSize: 20, lineHeight: 1,
              color: active ? "#00d4ff" : "rgba(255,255,255,0.25)",
              filter: active ? "drop-shadow(0 0 6px #00d4ff)" : "none",
              transition: "all 0.2s",
            }}>{icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: active ? "#00d4ff" : "rgba(255,255,255,0.25)",
              letterSpacing: "0.05em",
              textShadow: active ? "0 0 10px #00d4ff" : "none",
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── CRYSTAL VIDEO (popixel bg removal) ─────────────────────── */
function CrystalVideo({ size = 240 }: { size?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 20) {
        d[i + 3] = 0;
      } else if (lum < 55) {
        d[i + 3] = Math.round(((lum - 20) / 35) * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const video = videoRef.current!;
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <>
      <video
        ref={videoRef}
        src="/__mockup/crystal.webm"
        loop
        muted
        playsInline
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size, height: size,
          filter: "drop-shadow(0 0 22px rgba(0,180,255,0.85)) drop-shadow(0 0 55px rgba(124,58,237,0.65))",
        }}
      />
    </>
  );
}

/* ─── HOME ───────────────────────────────────────────────────── */
function HomeScreen() {
  const [score, setScore] = useState(5_682);
  const [flies, setFlies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [tapped, setTapped] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  let nextId = useRef(0);

  function tap(e: React.MouseEvent) {
    const rect = ref.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setScore(s => s + 1);
    setFlies(f => [...f, { id, x, y }]);
    setTapped(true);
    setTimeout(() => setTapped(false), 350);
    setTimeout(() => setFlies(f => f.filter(fly => fly.id !== id)), 900);
  }

  return (
    <div className="slide-in" style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: "40px 20px 100px", overflow: "hidden",
    }}>
      {/* Score */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: "0.2em",
          color: "rgba(0,212,255,0.5)", textTransform: "uppercase", marginBottom: 6,
        }}>GEMS BALANCE</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span className="shimmer-text" style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
            {score.toLocaleString("ru-RU")}
          </span>
          <span style={{ fontSize: 36, filter: "drop-shadow(0 0 12px #7c3aed)" }}>💎</span>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
          ≈ {(score / 1000).toFixed(2)} Gold · Exchange 1000:1
        </p>
      </div>

      {/* Gem Button */}
      <button
        ref={ref}
        onClick={tap}
        style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0 }}>

        {/* outer ring */}
        <div style={{
          position: "absolute", inset: -24, borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.12)",
          animation: "ring-spin 12s linear infinite",
        }}>
          {[0,90,180,270].map(a => (
            <div key={a} style={{
              position: "absolute", width: 6, height: 6, borderRadius: "50%",
              background: "#00d4ff", boxShadow: "0 0 10px #00d4ff",
              top: "50%", left: "50%",
              transform: `rotate(${a}deg) translateX(calc(50% + 10px)) translateY(-50%)`,
            }} />
          ))}
        </div>
        {/* mid ring */}
        <div style={{
          position: "absolute", inset: -12, borderRadius: "50%",
          border: "1px solid rgba(124,58,237,0.2)",
          animation: "ring-spin-rev 8s linear infinite",
        }} />

        <div className={`gem-container${tapped ? " tapped" : ""}`} style={{ position: "relative" }}>
          <CrystalVideo size={240} />
        </div>

        {/* fly texts */}
        {flies.map(f => <FlyText key={f.id} {...f} />)}
      </button>

      {/* Tap hint */}
      <p style={{
        fontSize: 11, color: "rgba(0,212,255,0.35)", letterSpacing: "0.15em",
        textTransform: "uppercase", animation: "neon-pulse 2s ease-in-out infinite",
      }}>
        ◈ ТАП ДЛЯ ДОБЫЧИ ◈
      </p>
    </div>
  );
}

/* ─── MINING ─────────────────────────────────────────────────── */
const MINERS = [
  { tokenId: 4, name: "Basic",    gemsDay: 30_000,  color: "#00d4ff", glyph: "◈" },
  { tokenId: 5, name: "Advanced", gemsDay: 70_000,  color: "#a855f7", glyph: "⬡" },
  { tokenId: 6, name: "Elite",    gemsDay: 150_000, color: "#f59e0b", glyph: "◉" },
  { tokenId: 7, name: "Pro",      gemsDay: 350_000, color: "#ff4cf2", glyph: "★" },
];

function MiningScreen() {
  const [subTab, setSubTab] = useState<"owned"|"shop">("shop");
  const [wallet, setWallet] = useState(false);

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 100px", gap: 12, overflow: "auto" }}>

      {/* Wallet */}
      <div className="glass" style={{ borderRadius: 20, padding: "14px 18px" }}>
        {wallet ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, color: "rgba(0,212,255,0.5)", letterSpacing: "0.1em", marginBottom: 2 }}>WALLET CONNECTED</p>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#00d4ff" }} className="neon-text-blue">0x3365...48587</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>0.00 LUX</p>
            </div>
            <button onClick={() => setWallet(false)} style={{
              fontSize: 10, color: "rgba(255,80,80,0.6)", background: "none",
              border: "1px solid rgba(255,80,80,0.2)", borderRadius: 8,
              padding: "4px 10px", cursor: "pointer",
            }}>Disconnect</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Wallet not connected</p>
            <button onClick={() => setWallet(true)} className="lux-btn" style={{
              padding: "8px 18px", borderRadius: 12, fontSize: 12,
              fontWeight: 700, color: "#00d4ff", letterSpacing: "0.05em",
            }}>Connect</button>
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["owned", "shop"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 12,
            fontWeight: 700, cursor: "pointer", border: "none", letterSpacing: "0.05em",
            ...(subTab === t ? {
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))",
              border: "1px solid rgba(0,212,255,0.35)",
              color: "#00d4ff", boxShadow: "0 0 16px rgba(0,212,255,0.2)",
            } : {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.3)",
            }),
          }}>
            {t === "owned" ? "Owned NFTs" : "Miners Shop"}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === "shop" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MINERS.map(m => (
            <div key={m.tokenId} className="glass" style={{
              borderRadius: 18, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
              border: `1px solid ${m.color}22`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `radial-gradient(circle at 40% 35%, ${m.color}44, ${m.color}11)`,
                border: `1px solid ${m.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
                boxShadow: `0 0 16px ${m.color}22`,
              }}>{m.glyph}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.name} Miner</span>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: m.color, opacity: 0.6 }}>#{m.tokenId}</span>
                </div>
                <p style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>
                  {m.gemsDay.toLocaleString()} 💎 / день
                </p>
                <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2, width: `${(m.gemsDay / 350000) * 100}%`,
                    background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                    boxShadow: `0 0 8px ${m.color}`,
                  }} />
                </div>
              </div>
              <button className="lux-btn" style={{
                padding: "7px 12px", borderRadius: 10, fontSize: 10,
                fontWeight: 700, color: m.color, whiteSpace: "nowrap",
                border: `1px solid ${m.color}44`,
                background: `linear-gradient(135deg, ${m.color}11, ${m.color}22)`,
              }}>Buy LUX</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>⬡</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              {wallet ? "No NFT miners in wallet" : "Connect wallet to view"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TASKS ──────────────────────────────────────────────────── */
function TasksScreen() {
  const [claimed, setClaimed] = useState(false);
  const [tasks, setTasks] = useState([
    { text: "Click 100 times", reward: "500 💎", done: true },
    { text: "Login 7 days in a row", reward: "2,000 💎", done: false },
    { text: "Invite 1 friend", reward: "50,000 💎", done: false },
  ]);

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 100px", gap: 12, overflow: "auto" }}>

      {/* Daily Reward */}
      <div className="glass-strong" style={{
        borderRadius: 22, padding: "20px 20px",
        border: "1px solid rgba(255,180,0,0.2)",
        boxShadow: "0 0 40px rgba(255,180,0,0.08)",
      }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,180,0,0.5)", marginBottom: 8 }}>DAILY REWARD · КАЖДЫЕ 3 ЧАСА</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="shimmer-text" style={{ fontSize: 36, fontWeight: 900 }}>5 000</span>
              <span style={{ fontSize: 28 }}>💎</span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>= 5 Gold после обмена</p>
          </div>
          {claimed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80" }}>
              <span>✓</span><span style={{ fontSize: 12, fontWeight: 700 }}>Claimed</span>
            </div>
          ) : (
            <button onClick={() => setClaimed(true)} className="lux-btn" style={{
              padding: "10px 22px", borderRadius: 14, fontSize: 13,
              fontWeight: 800, color: "#ffd700", letterSpacing: "0.05em",
              border: "1px solid rgba(255,215,0,0.35)",
              background: "linear-gradient(135deg, rgba(255,180,0,0.15), rgba(255,215,0,0.2))",
              boxShadow: "0 0 24px rgba(255,180,0,0.2)",
            }}>Take</button>
          )}
        </div>
      </div>

      {/* Referral */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Приглашай друзей — получай бонусы</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { l: "1 друг", v: "50K" },
            { l: "3 друга", v: "200K" },
            { l: "5 друзей", v: "350K" },
          ].map(r => (
            <div key={r.l} style={{
              background: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.1)",
              borderRadius: 12, padding: "8px 4px", textAlign: "center",
            }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{r.l}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#00d4ff" }} className="neon-text-blue">{r.v} 💎</p>
            </div>
          ))}
        </div>
        <button className="lux-btn" style={{
          width: "100%", padding: "10px 0", borderRadius: 14,
          fontSize: 12, fontWeight: 700, color: "#00d4ff",
        }}>⊕ Invite Friend</button>
      </div>

      {/* Daily tasks */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>DAILY TASKS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: task.done ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${task.done ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)"}`,
              cursor: "pointer",
            }} onClick={() => {
              const copy = [...tasks];
              copy[i] = { ...copy[i], done: !copy[i].done };
              setTasks(copy);
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{task.done ? "✅" : "⬜"}</span>
              <span style={{ flex: 1, fontSize: 11, color: task.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)" }}>
                {task.text}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ffd700" }} className="neon-text-gold">
                {task.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE ────────────────────────────────────────────────── */
function ProfileScreen() {
  const [wallet, setWallet] = useState(false);

  return (
    <div className="slide-in" style={{ flex: 1, overflow: "auto", padding: "20px 16px 100px" }}>
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, rgba(0,212,255,0.6) 0%, rgba(100,40,200,0.8) 60%, rgba(10,0,40,0.95) 100%)",
          border: "2px solid rgba(0,212,255,0.4)",
          boxShadow: "0 0 30px rgba(0,212,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, marginBottom: 10,
        }}>👤</div>
        <p className="neon-text-blue" style={{ fontSize: 20, fontWeight: 800, color: "#00d4ff" }}>LUXury_CEO</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Telegram · @LUX_Clicker_bot</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Stats */}
        <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>АККАУНТ</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Game Account", value: "Active", color: "#4ade80" },
              { label: "Gold Balance", value: "7,939 ◈", color: "#ffd700" },
              { label: "Username", value: "Dim", color: "#00d4ff" },
              { label: "Gems", value: "5,682 💎", color: "#c77dff" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: 12,
                padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4, letterSpacing: "0.08em" }}>{s.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet */}
        <div className="glass" style={{
          borderRadius: 20, padding: "16px 18px",
          border: wallet ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(255,80,80,0.15)",
        }}>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>WALLET</p>
          {wallet ? (
            <div>
              <p style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, marginBottom: 4 }}>✓ Connected</p>
              <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(0,212,255,0.6)" }}>0x3365...48587</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Balance: 0.00 LUX</p>
              <button onClick={() => setWallet(false)} style={{
                marginTop: 10, fontSize: 10, color: "rgba(255,80,80,0.5)",
                background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
              }}>Disconnect</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: "rgba(255,100,100,0.6)" }}>Not connected</p>
              <button onClick={() => setWallet(true)} className="lux-btn" style={{
                padding: "8px 18px", borderRadius: 12, fontSize: 11,
                fontWeight: 700, color: "#00d4ff",
              }}>Connect</button>
            </div>
          )}
        </div>

        {/* Actions */}
        {[
          { label: "⇄ Exchange Gems → Gold", sub: "1000 💎 = 1 ◈ Gold" },
          { label: "◎ Referrals", sub: "Пригласи друзей" },
        ].map(b => (
          <button key={b.label} className="lux-btn" style={{
            width: "100%", padding: "14px 18px", borderRadius: 16,
            textAlign: "left", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{b.label}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{b.sub}</p>
            </div>
            <span style={{ color: "rgba(0,212,255,0.5)", fontSize: 16 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── AUTH SCREEN ─────────────────────────────────────────────── */
function AuthScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32, padding: "40px 30px",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%", margin: "0 auto 16px",
          background: "radial-gradient(circle at 38% 32%, rgba(0,212,255,0.6) 0%, rgba(100,40,200,0.8) 45%, rgba(10,0,40,0.95) 100%)",
          boxShadow: "0 0 50px rgba(0,212,255,0.5), 0 0 100px rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
          animation: "neon-pulse 3s ease-in-out infinite",
        }}>💎</div>
        <h1 className="shimmer-text" style={{ fontSize: 28, fontWeight: 900, margin: "0 0 4px" }}>LUXury Clicker</h1>
        <p style={{ fontSize: 11, color: "rgba(0,212,255,0.4)", letterSpacing: "0.15em" }}>
          P2E · TELEGRAM MINI APP · POLYGON
        </p>
      </div>

      {/* Auth Card */}
      <div className="glass-strong" style={{
        borderRadius: 24, padding: "28px 28px",
        border: "1px solid rgba(0,212,255,0.15)",
        boxShadow: "0 0 50px rgba(0,212,255,0.06)",
        width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Telegram Authorization</p>
        <button onClick={onLogin} style={{
          width: "100%", padding: "13px 0", borderRadius: 14,
          background: "linear-gradient(135deg, #0088cc, #005fa3)",
          border: "1px solid rgba(0,136,204,0.4)",
          boxShadow: "0 0 24px rgba(0,136,204,0.35)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontSize: 13, fontWeight: 700, color: "#fff",
          transition: "all 0.2s",
        }}>
          <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.03 9.564c-.153.68-.553.847-1.12.527l-3.1-2.285-1.495 1.437c-.165.165-.304.304-.623.304l.223-3.162 5.748-5.192c.25-.222-.054-.345-.388-.123L6.8 14.51l-3.051-.952c-.663-.207-.676-.663.138-.98l11.916-4.595c.55-.2 1.033.134.759.265z" />
          </svg>
          Log in with Telegram
        </button>
      </div>

      {/* Stats preview */}
      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        {[
          { icon: "💎", label: "Gems", value: "∞" },
          { icon: "⬡", label: "Miners", value: "4 NFT" },
          { icon: "◈", label: "Chain", value: "Polygon" },
        ].map(s => (
          <div key={s.label} className="glass" style={{
            flex: 1, borderRadius: 14, padding: "10px 8px", textAlign: "center",
          }}>
            <p style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff" }}>{s.value}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export function LuxUI() {
  useStyles();
  const [screen, setScreen] = useState<"auth" | "game">("auth");
  const [tab, setTab] = useState<Tab>("home");

  const screens: Record<Tab, React.ReactNode> = {
    home:    <HomeScreen />,
    mining:  <MiningScreen />,
    tasks:   <TasksScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="lux-root" style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <PhoneShell>
        {screen === "auth" ? (
          <AuthScreen onLogin={() => { setScreen("game"); setTab("home"); }} />
        ) : (
          <>
            {screens[tab]}
            <Nav tab={tab} setTab={setTab} />
          </>
        )}
      </PhoneShell>
    </div>
  );
}
