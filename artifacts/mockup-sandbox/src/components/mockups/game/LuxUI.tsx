import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes blob-drift {
  0%   { transform: translate(0px,0px) scale(1) rotate(0deg); }
  33%  { transform: translate(60px,-40px) scale(1.15) rotate(120deg); }
  66%  { transform: translate(-30px,50px) scale(0.9) rotate(240deg); }
  100% { transform: translate(0px,0px) scale(1) rotate(360deg); }
}
@keyframes blob-drift2 {
  0%   { transform: translate(0px,0px) scale(1); }
  50%  { transform: translate(-80px,60px) scale(1.2); }
  100% { transform: translate(0px,0px) scale(1); }
}
@keyframes gem-float {
  0%,100% { transform: translateY(0px) scale(1); filter: brightness(1); }
  50%      { transform: translateY(-12px) scale(1.03); filter: brightness(1.2); }
}
@keyframes gem-tap {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.88); }
  70%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes neon-pulse {
  0%,100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes ring-spin     { from { transform: rotate(0deg); }  to { transform: rotate(360deg); } }
@keyframes ring-spin-rev { from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } }
@keyframes fly-up {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-80px); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lux-root { font-family: 'Inter', system-ui, sans-serif; color: #fff; }

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
.shimmer-text {
  background: linear-gradient(90deg, #c9a227 0%, #fff8dc 25%, #ffd700 50%, #fff8dc 75%, #c9a227 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}
.neon-blue  { text-shadow: 0 0 12px #00d4ff, 0 0 30px #00d4ff88; color: #00d4ff; }
.neon-gold  { text-shadow: 0 0 14px #ffd700, 0 0 35px #ffd70066; color: #ffd700; }
.neon-cyan  { text-shadow: 0 0 12px #00fff7, 0 0 28px #00fff766; color: #00fff7; }

.lux-btn {
  background: linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(124,58,237,0.2) 100%);
  border: 1px solid rgba(0,212,255,0.35);
  box-shadow: 0 0 20px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.2s;
  cursor: pointer;
  color: #00d4ff;
  font-family: 'Inter', system-ui, sans-serif;
}
.lux-btn:hover {
  background: linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(124,58,237,0.35) 100%);
  box-shadow: 0 0 35px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-1px);
}
.lux-btn:active { transform: scale(0.97); }

.gem-float { animation: gem-float 3.5s ease-in-out infinite; }
.gem-tapped { animation: gem-tap 0.35s ease forwards !important; }
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

/* ─── BG ─────────────────────────────────────────────────────── */
function LuxBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 20%, #0d1f3c 0%, #02060f 60%, #000208 100%)" }} />
      <div style={{ position: "absolute", width: 700, height: 700, top: "-15%", left: "-10%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,255,0.13) 0%, transparent 70%)", animation: "blob-drift 18s ease-in-out infinite", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, bottom: "-10%", right: "5%", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", animation: "blob-drift2 14s ease-in-out infinite", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", width: 400, height: 400, top: "40%", left: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,180,0,0.08) 0%, transparent 70%)", animation: "blob-drift 22s ease-in-out infinite reverse", filter: "blur(35px)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    </div>
  );
}

/* ─── FLY TEXT ───────────────────────────────────────────────── */
function FlyText({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <div key={id} style={{ position: "absolute", left: x - 15, top: y - 30, color: "#00fff7", fontWeight: 800, fontSize: 22, pointerEvents: "none", zIndex: 50, animation: "fly-up 0.9s ease forwards", textShadow: "0 0 14px #00fff7" }}>
      +1 💎
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
    <div className="glass" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px 18px", borderTop: "1px solid rgba(0,212,255,0.12)", display: "flex", justifyContent: "space-around" }}>
      {TABS.map(({ id, icon, label }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", background: active ? "linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.15))" : "none", border: active ? "1px solid rgba(0,212,255,0.25)" : "none", boxShadow: active ? "0 0 20px rgba(0,212,255,0.15)" : "none", padding: "8px 14px", borderRadius: 16, transition: "all 0.2s" }}>
            <span style={{ fontSize: 20, lineHeight: 1, color: active ? "#00d4ff" : "rgba(255,255,255,0.25)", filter: active ? "drop-shadow(0 0 6px #00d4ff)" : "none", transition: "all 0.2s" }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? "#00d4ff" : "rgba(255,255,255,0.25)", letterSpacing: "0.05em", textShadow: active ? "0 0 10px #00d4ff" : "none" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── TYPES ──────────────────────────────────────────────────── */
type GameConfig = {
  exchangeGemsPerGold: number;
  dailyReward: number;
  dailyRewardTime: number;
  minersStats: { tokenId: string; gemsPerDay: string }[];
};
type TgUser = { id: number; username?: string; first_name?: string };

const DEFAULT_CONFIG: GameConfig = {
  exchangeGemsPerGold: 1000,
  dailyReward: 5000,
  dailyRewardTime: 10800,
  minersStats: [
    { tokenId: "4", gemsPerDay: "30000" },
    { tokenId: "5", gemsPerDay: "70000" },
    { tokenId: "6", gemsPerDay: "150000" },
    { tokenId: "7", gemsPerDay: "350000" },
  ],
};

/* ─── AUTH ───────────────────────────────────────────────────── */
function AuthScreen({
  onLogin, config, loading,
}: {
  onLogin: () => void;
  config: GameConfig;
  loading: boolean;
}) {
  const daily = config.dailyReward.toLocaleString("ru-RU");
  const exchange = config.exchangeGemsPerGold.toLocaleString("ru-RU");

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 24px 32px" }}>
      {/* Crystal — centered */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src="/__mockup/crystal.png" style={{ width: 220, height: 198, objectFit: "contain", filter: "drop-shadow(0 0 32px rgba(0,180,255,0.7)) drop-shadow(0 0 70px rgba(124,58,237,0.5))", animation: "gem-float 3.5s ease-in-out infinite" }} alt="crystal" />
        <h1 className="shimmer-text" style={{ fontSize: 26, fontWeight: 900, marginBottom: 4, marginTop: 16 }}>AliTerra Miner</h1>
        <p style={{ fontSize: 10, color: "rgba(0,212,255,0.4)", letterSpacing: "0.15em" }}>P2E · TELEGRAM MINI APP · POLYGON</p>
      </div>

      {/* Telegram login */}
      <div className="glass-strong" style={{ borderRadius: 24, padding: "22px 20px", border: "1px solid rgba(0,212,255,0.15)", boxShadow: "0 0 50px rgba(0,212,255,0.06)", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <p style={{ fontSize: 15, fontWeight: 700 }}>Telegram Authorization</p>
        <button onClick={onLogin} style={{ width: "100%", padding: "12px 0", borderRadius: 14, background: "linear-gradient(135deg, #0088cc, #005fa3)", border: "1px solid rgba(0,136,204,0.4)", boxShadow: "0 0 24px rgba(0,136,204,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#fff", transition: "all 0.2s" }}>
          <svg viewBox="0 0 24 24" fill="white" style={{ width: 18, height: 18 }}>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.03 9.564c-.153.68-.553.847-1.12.527l-3.1-2.285-1.495 1.437c-.165.165-.304.304-.623.304l.223-3.162 5.748-5.192c.25-.222-.054-.345-.388-.123L6.8 14.51l-3.051-.952c-.663-.207-.676-.663.138-.98l11.916-4.595c.55-.2 1.033.134.759.265z" />
          </svg>
          Log in with Telegram
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        {[
          { icon: "💎", val: "∞", label: "Gems" },
          { icon: "⬡", val: "4 NFT", label: "Miners" },
        ].map(s => (
          <div key={s.label} className="glass" style={{ flex: 1, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff" }}>{s.val}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
          </div>
        ))}
        <div className="glass" style={{ flex: 1, borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
          <img src="/__mockup/polygon.png" style={{ width: 22, height: 22, margin: "0 auto 3px", display: "block", objectFit: "contain" }} alt="polygon" />
          <p style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff" }}>Polygon</p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>Chain</p>
        </div>
      </div>

      {/* Daily / Exchange — реальные данные с бэкенда */}
      <div className="glass" style={{ borderRadius: 14, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", opacity: loading ? 0.5 : 1, transition: "opacity 0.3s" }}>
        <div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Daily Reward</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#00d4ff" }}>
            {loading ? "..." : `${daily} Gems`}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Exchange Rate</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#00d4ff" }}>
            {loading ? "..." : `1 Gold = ${exchange} Gems`}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── HOME ───────────────────────────────────────────────────── */
function HomeScreen() {
  const [score, setScore] = useState(5_682);
  const [flies, setFlies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [tapped, setTapped] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const nextId = useRef(0);

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
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "32px 20px 100px" }}>

      {/* Score inline */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span className="shimmer-text" style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
          {score.toLocaleString("ru-RU")}
        </span>
        <img src="/__mockup/crystal.png" style={{ width: 54, height: 48, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(0,180,255,0.6))" }} alt="gem" />
      </div>

      {/* Crystal tap button */}
      <button ref={ref} onClick={tap} style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: 0, marginTop: 20 }}>
        {/* rings */}
        <div style={{ position: "absolute", inset: -24, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.12)", animation: "ring-spin 12s linear infinite" }}>
          {[0, 90, 180, 270].map(a => (
            <div key={a} style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 10px #00d4ff", top: "50%", left: "50%", transform: `rotate(${a}deg) translateX(calc(50% + 10px)) translateY(-50%)` }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.2)", animation: "ring-spin-rev 8s linear infinite" }} />

        <div className={tapped ? "gem-tapped" : "gem-float"} style={{ position: "relative" }}>
          {/* glow */}
          <div style={{ position: "absolute", inset: -30, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.25) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)", animation: "neon-pulse 2.5s ease-in-out infinite" }} />
          <img
            src="/__mockup/crystal.png"
            style={{ width: 432, height: 350, objectFit: "contain", position: "relative", filter: "drop-shadow(0 0 36px rgba(0,180,255,0.85)) drop-shadow(0 0 80px rgba(124,58,237,0.65))" }}
            alt="crystal"
          />
        </div>

        {flies.map(f => <FlyText key={f.id} {...f} />)}
      </button>

      {/* Tap hint */}
      <p style={{ fontSize: 11, color: "rgba(0,212,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", animation: "neon-pulse 2s ease-in-out infinite" }}>
        ◈ ТАП ДЛЯ ДОБЫЧИ ◈
      </p>
    </div>
  );
}

/* ─── MINING ─────────────────────────────────────────────────── */
const MINERS = [
  { tokenId: 4, name: "Basic",    gemsDay: 30_000,  color: "#00d4ff" },
  { tokenId: 5, name: "Advanced", gemsDay: 70_000,  color: "#a855f7" },
  { tokenId: 6, name: "Elite",    gemsDay: 150_000, color: "#f59e0b" },
  { tokenId: 7, name: "Pro",      gemsDay: 350_000, color: "#ff4cf2" },
];

function MiningScreen() {
  const [subTab, setSubTab] = useState<"owned" | "shop">("owned");
  const [wallet, setWallet] = useState(false);

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 100px", gap: 12, overflowY: "auto" }}>
      {/* Wallet */}
      <div className="glass" style={{ borderRadius: 20, padding: "14px 18px" }}>
        {wallet ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, color: "rgba(0,212,255,0.5)", letterSpacing: "0.1em", marginBottom: 2 }}>WALLET CONNECTED</p>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#00d4ff", textShadow: "0 0 10px #00d4ff88" }}>0x3365...48587</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>0.00 LUX</p>
            </div>
            <button onClick={() => setWallet(false)} style={{ fontSize: 10, color: "rgba(255,80,80,0.6)", background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>Disconnect</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Wallet not connected</p>
            <button onClick={() => setWallet(true)} className="lux-btn" style={{ padding: "8px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>Connect</button>
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["owned", "shop"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={subTab === t ? "lux-btn" : ""} style={{ flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", ...(subTab === t ? {} : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }) }}>
            {t === "owned" ? "Owned NFTs" : "Miners Shop"}
          </button>
        ))}
      </div>

      {subTab === "shop" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MINERS.map(m => (
            <div key={m.tokenId} className="glass" style={{ borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: `1px solid ${m.color}22` }}>
              <img src="/__mockup/crystal.png" style={{ width: 40, height: 36, objectFit: "contain", filter: `drop-shadow(0 0 8px ${m.color}88)` }} alt="miner" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name} Miner</span>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: m.color, opacity: 0.6 }}>#{m.tokenId}</span>
                </div>
                <p style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.gemsDay.toLocaleString()} 💎 / день</p>
                <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${(m.gemsDay / 350000) * 100}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})`, boxShadow: `0 0 8px ${m.color}` }} />
                </div>
              </div>
              <button className="lux-btn" style={{ padding: "7px 12px", borderRadius: 10, fontSize: 10, fontWeight: 700, color: m.color, whiteSpace: "nowrap", border: `1px solid ${m.color}44`, background: `linear-gradient(135deg, ${m.color}11, ${m.color}22)` }}>Buy LUX</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>⬡</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>{wallet ? "No NFT miners in wallet" : "Connect wallet to view"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TASKS ──────────────────────────────────────────────────── */
function TasksScreen({ config }: { config: GameConfig }) {
  const [claimed, setClaimed] = useState(false);
  const daily = config.dailyReward.toLocaleString("ru-RU");
  const cooldownH = Math.round(config.dailyRewardTime / 3600);
  const tasks = [
    { text: "Click 100 times",      reward: "500 💎",    done: true },
    { text: "Login 7 days in a row", reward: "2,000 💎",  done: false },
    { text: "Invite 1 friend",       reward: "50,000 💎", done: false },
  ];

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 100px", gap: 12, overflowY: "auto" }}>
      {/* Daily */}
      <div className="glass-strong" style={{ borderRadius: 22, padding: "20px", border: "1px solid rgba(255,180,0,0.2)", boxShadow: "0 0 40px rgba(255,180,0,0.08)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,180,0,0.5)", marginBottom: 8 }}>DAILY REWARD · КАЖДЫЕ {cooldownH} ЧАСА</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="shimmer-text" style={{ fontSize: 36, fontWeight: 900 }}>{daily}</span>
              <span style={{ fontSize: 28 }}>💎</span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>= 5 Gold после обмена</p>
          </div>
          {claimed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80" }}>
              <span>✓</span><span style={{ fontSize: 12, fontWeight: 700 }}>Claimed</span>
            </div>
          ) : (
            <button onClick={() => setClaimed(true)} className="lux-btn" style={{ padding: "10px 22px", borderRadius: 14, fontSize: 13, fontWeight: 800, color: "#ffd700", border: "1px solid rgba(255,215,0,0.35)", background: "linear-gradient(135deg, rgba(255,180,0,0.15), rgba(255,215,0,0.2))", boxShadow: "0 0 24px rgba(255,180,0,0.2)" }}>Take</button>
          )}
        </div>
      </div>

      {/* Referrals */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Приглашай друзей — получай бонусы</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[{ l: "1 друг", v: "50K" }, { l: "3 друга", v: "200K" }, { l: "5 друзей", v: "350K" }].map(r => (
            <div key={r.l} style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{r.l}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#00d4ff", textShadow: "0 0 10px #00d4ff88" }}>{r.v} 💎</p>
            </div>
          ))}
        </div>
        <button className="lux-btn" style={{ width: "100%", padding: "10px 0", borderRadius: 14, fontSize: 12, fontWeight: 700 }}>⊕ Invite Friend</button>
      </div>

      {/* Tasks list */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>DAILY TASKS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: t.done ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)", border: t.done ? "1px solid rgba(74,222,128,0.15)" : "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <span style={{ fontSize: 14 }}>{t.done ? "✅" : "⬜"}</span>
              <span style={{ flex: 1, fontSize: 11, color: t.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)" }}>{t.text}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ffd700", textShadow: "0 0 10px #ffd70066" }}>{t.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE ────────────────────────────────────────────────── */
function ProfileScreen({ tgUser }: { tgUser: TgUser | null }) {
  const displayName = tgUser?.username
    ? `@${tgUser.username}`
    : tgUser?.first_name ?? "LUXury_CEO";

  return (
    <div className="slide-in" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 100px", gap: 12, overflowY: "auto" }}>
      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 8 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, rgba(0,212,255,0.6) 0%, rgba(100,40,200,0.8) 60%, rgba(10,0,40,0.95) 100%)", border: "2px solid rgba(0,212,255,0.4)", boxShadow: "0 0 30px rgba(0,212,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 10 }}>👤</div>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#00d4ff", textShadow: "0 0 12px #00d4ff88" }}>{displayName}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
          {tgUser?.id ? `Telegram ID: ${tgUser.id}` : "Telegram · @LUX_Clicker_bot"}
        </p>
      </div>

      {/* Stats */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>АККАУНТ</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Game Account", val: "Active",    color: "#4ade80" },
            { label: "Gold Balance", val: "7,939 ◈",  color: "#ffd700" },
            { label: "Username",     val: tgUser?.first_name ?? "Dim", color: "#00d4ff" },
            { label: "Gems",         val: "5,682 💎",  color: "#c77dff" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4, letterSpacing: "0.08em" }}>{s.label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet */}
      <div className="glass" style={{ borderRadius: 20, padding: "16px 18px", border: "1px solid rgba(255,80,80,0.15)" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>WALLET</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, color: "rgba(255,100,100,0.6)" }}>Not connected</p>
          <button className="lux-btn" style={{ padding: "8px 18px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Connect</button>
        </div>
      </div>

      {/* Actions */}
      {[
        { icon: "⇄", title: "Exchange Gems → Gold", sub: "1000 💎 = 1 ◈ Gold" },
        { icon: "◎", title: "Referrals", sub: "Пригласи друзей" },
      ].map(a => (
        <button key={a.title} className="lux-btn" style={{ width: "100%", padding: "14px 18px", borderRadius: 16, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{a.icon} {a.title}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{a.sub}</p>
          </div>
          <span style={{ color: "rgba(0,212,255,0.5)", fontSize: 16 }}>›</span>
        </button>
      ))}
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────────── */
export function LuxUI() {
  useStyles();
  const [authed, setAuthed]   = useState(false);
  const [tab, setTab]         = useState<Tab>("home");
  const [config, setConfig]   = useState<GameConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [tgUser, setTgUser]   = useState<TgUser | null>(null);

  useEffect(() => {
    // 1 — Telegram WebApp auto-login
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user: TgUser | undefined = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTgUser(user);
        setAuthed(true);
      }
    }

    // 2 — Fetch game config from real backend
    fetch("https://clicker.aliterra.space/miners/get-miners-config.php", {
      method: "POST",
    })
      .then(r => r.json())
      .then((data: GameConfig) => {
        setConfig({
          exchangeGemsPerGold: Number(data.exchangeGemsPerGold) || DEFAULT_CONFIG.exchangeGemsPerGold,
          dailyReward:         Number(data.dailyReward)         || DEFAULT_CONFIG.dailyReward,
          dailyRewardTime:     Number(data.dailyRewardTime)     || DEFAULT_CONFIG.dailyRewardTime,
          minersStats:         data.minersStats                 || DEFAULT_CONFIG.minersStats,
        });
      })
      .catch(() => {
        // CORS или сеть — остаёмся на дефолтных значениях
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lux-root" style={{ width: "100vw", height: "100vh", background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        width: 390, height: 780,
        borderRadius: 44, overflow: "hidden", position: "relative",
        border: "1.5px solid rgba(0,212,255,0.2)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(124,58,237,0.1), 0 40px 80px rgba(0,0,0,0.8)",
      }}>
        <LuxBg />
        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>
          {!authed ? (
            <AuthScreen onLogin={() => setAuthed(true)} config={config} loading={loading} />
          ) : (
            <>
              {tab === "home"    && <HomeScreen />}
              {tab === "mining"  && <MiningScreen />}
              {tab === "tasks"   && <TasksScreen config={config} />}
              {tab === "profile" && <ProfileScreen tgUser={tgUser} />}
              <Nav tab={tab} setTab={setTab} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LuxUI;
