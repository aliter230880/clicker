import { useState } from "react";
type Screen = "auth" | "game";
type Tab = "home" | "mining" | "tasks" | "profile";
type MiningTab = "owned" | "shop";

/* ═══════════════════════════════════════════════════════
   DIAMOND BACKGROUND
═══════════════════════════════════════════════════════ */
function DiamondBg() {
  const S = 90;
  const cols = 6, rows = 13;
  const W = cols * S, H = rows * S;

  function Leaf({ cx, cy }: { cx: number; cy: number }) {
    return (
      <g transform={`translate(${cx},${cy})`}>
        <ellipse rx="2.8" ry="7.5" fill="#c8960a" transform="rotate(0)" opacity="0.9" />
        <ellipse rx="2.8" ry="7.5" fill="#c8960a" transform="rotate(60)" opacity="0.9" />
        <ellipse rx="2.8" ry="7.5" fill="#c8960a" transform="rotate(-60)" opacity="0.9" />
        <circle r="3" fill="#e8c030" />
      </g>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#04090f" }} />
      <svg className="absolute inset-0" width="100%" height="100%"
        viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="dg" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#1c3055" />
            <stop offset="50%" stopColor="#0d1e35" />
            <stop offset="100%" stopColor="#050c18" />
          </radialGradient>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(200,160,30,0.3)" />
            <stop offset="100%" stopColor="rgba(100,80,10,0.05)" />
          </linearGradient>
        </defs>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const cx = c * S + S / 2, cy = r * S + S / 2;
            const h = S / 2 - 2;
            const pts = `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
            return (
              <g key={`${r}-${c}`}>
                <polygon points={pts} fill="url(#dg)" />
                <polygon points={pts} fill="url(#shine)" />
                <polygon points={pts} fill="none" stroke="#a07008" strokeWidth="0.9" opacity="0.7" />
                {/* inner bevel */}
                <polygon
                  points={`${cx},${cy - h + 10} ${cx + h - 10},${cy} ${cx},${cy + h - 10} ${cx - h + 10},${cy}`}
                  fill="none" stroke="rgba(180,140,20,0.1)" strokeWidth="0.5"
                />
                {/* highlight edge */}
                <line x1={cx - h} y1={cy} x2={cx} y2={cy - h} stroke="rgba(220,175,50,0.22)" strokeWidth="0.8" />
              </g>
            );
          })
        )}
        {Array.from({ length: rows + 1 }).map((_, r) =>
          Array.from({ length: cols + 1 }).map((_, c) => (
            <Leaf key={`l-${r}-${c}`} cx={c * S} cy={r * S} />
          ))
        )}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════ */
function Panel({ children, className = "", py = "p-4" }: { children: React.ReactNode; className?: string; py?: string }) {
  return (
    <div className={`rounded-xl ${py} ${className}`} style={{
      background: "linear-gradient(155deg,#0f2248ee 0%,#091530ee 100%)",
      border: "1px solid rgba(55,95,210,0.38)",
      boxShadow: "0 4px 28px rgba(8,24,90,0.55),inset 0 1px 0 rgba(100,160,255,0.07)",
      backdropFilter: "blur(6px)",
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, sm, full, ghost }: {
  children: React.ReactNode; onClick?: () => void;
  sm?: boolean; full?: boolean; ghost?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`font-bold text-white rounded-lg ${sm ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-base"} ${full ? "w-full" : ""}`}
      style={{
        background: ghost ? "transparent" : "linear-gradient(180deg,#1e52f0 0%,#0d2a95 100%)",
        border: "1px solid rgba(80,145,255,0.55)",
        boxShadow: ghost ? "none" : "0 0 18px rgba(40,100,255,0.35),inset 0 1px 0 rgba(160,210,255,0.18)",
        letterSpacing: "0.02em",
      }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH SCREEN  (clicker.aliterra.space gate)
═══════════════════════════════════════════════════════ */
function AuthScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 relative z-10">
      {/* logo area */}
      <div className="flex flex-col items-center gap-3">
        <div style={{
          width: 90, height: 90, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%,#4a8fff 0%,#1a4aee 45%,#091e70 100%)",
          boxShadow: "0 0 40px rgba(60,140,255,0.7),0 0 80px rgba(30,80,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
        }}>
          💎
        </div>
        <p className="text-white text-2xl font-extrabold tracking-wide"
          style={{ textShadow: "0 0 20px rgba(120,180,255,0.7)" }}>
          LUXury Clicker
        </p>
        <p className="text-blue-400/60 text-xs">Telegram Mini App · P2E Game</p>
      </div>

      {/* auth card — matches real site */}
      <div className="rounded-2xl px-8 py-6 flex flex-col items-center gap-4 w-72"
        style={{
          background: "rgba(22,30,50,0.95)",
          border: "1px solid rgba(60,90,160,0.3)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
        <p className="text-white font-bold text-lg text-center">Telegram Authorization</p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{
            background: "linear-gradient(135deg,#2ea6ff,#1a7ad4)",
            boxShadow: "0 0 16px rgba(46,166,255,0.4)",
          }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.03 9.564c-.153.68-.553.847-1.12.527l-3.1-2.285-1.495 1.437c-.165.165-.304.304-.623.304l.223-3.162 5.748-5.192c.25-.222-.054-.345-.388-.123L6.8 14.51l-3.051-.952c-.663-.207-.676-.663.138-.98l11.916-4.595c.55-.2 1.033.134.759.265z" />
          </svg>
          Log in with Telegram
        </button>
      </div>

      <p className="text-slate-600 text-xs text-center px-8">
        Открой игру через Telegram,<br />чтобы войти без авторизации
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════════ */
const HEX = "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)";
const NAV: { id: Tab; label: string; emoji: string }[] = [
  { id: "home",    label: "Home",    emoji: "🏠" },
  { id: "mining",  label: "Mining",  emoji: "⏳" },
  { id: "tasks",   label: "Tasks",   emoji: "❗" },
  { id: "profile", label: "Profile", emoji: "👤" },
];

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-2 pt-1 pb-3"
      style={{ background: "linear-gradient(to top,#020508 70%,transparent)" }}>
      {NAV.map(({ id, label, emoji }) => {
        const a = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-0.5 focus:outline-none">
            <div style={{
              clipPath: HEX, width: 58, height: 58,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: a
                ? "radial-gradient(circle at 36% 30%,#5590ff 0%,#1e4eee 38%,#0a1e88 100%)"
                : "radial-gradient(circle at 36% 30%,#1a2e65 0%,#0d1e4a 60%,#050e20 100%)",
              boxShadow: a ? "0 0 24px 6px rgba(60,140,255,0.6)" : "none",
              position: "relative",
              transition: "box-shadow 0.2s",
            }}>
              {a && <div style={{ position: "absolute", inset: 0, clipPath: HEX, border: "2px solid rgba(130,195,255,0.9)", pointerEvents: "none" }} />}
              <span style={{ fontSize: 24, lineHeight: 1 }}>{emoji}</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: a ? "#60aaff" : "#2e4a78",
              textShadow: a ? "0 0 10px #2060ff" : "none",
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════════════════════ */
function HomeScreen() {
  const [gems, setGems] = useState(5682);
  const [pulse, setPulse] = useState(false);

  function tap() {
    setGems(g => g + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 110);
  }

  return (
    <div className="flex flex-col items-center justify-between h-full pb-24 pt-8 select-none">
      {/* gems counter */}
      <div className="text-center">
        <p className="text-white font-bold text-xl" style={{ textShadow: "0 0 14px rgba(140,200,255,0.6)" }}>Gems:</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-white font-black text-[2.6rem] leading-none"
            style={{ textShadow: "0 0 24px rgba(110,180,255,0.7)" }}>
            {gems.toLocaleString("ru-RU")}
          </span>
          <span style={{ fontSize: 30, filter: "drop-shadow(0 0 8px #9060ff)" }}>💎</span>
        </div>
      </div>

      {/* big gem — tappable */}
      <button onClick={tap} className="focus:outline-none active:scale-90 transition-transform duration-75">
        <div style={{
          width: 230, height: 230,
          borderRadius: "50%",
          overflow: "hidden",
          transform: pulse ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.1s",
          boxShadow: [
            "0 0 50px rgba(60,160,255,0.7)",
            "0 0 100px rgba(40,100,255,0.4)",
            "0 0 160px rgba(30,60,200,0.2)",
          ].join(","),
        }}>
          <img src="/__mockup/images/screen-home.jpg" alt="gem"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 57%", pointerEvents: "none" }} />
        </div>
      </button>

      <div />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MINING SCREEN
═══════════════════════════════════════════════════════ */
function MiningScreen() {
  const [mTab, setMTab] = useState<MiningTab>("owned");
  const [connected, setConnected] = useState(false);

  const miners = [
    { name: "Basic Miner",    price: "500 Gold",    gems: "10 💎/hr",   id: 0 },
    { name: "Advanced Miner", price: "2,000 Gold",  gems: "50 💎/hr",   id: 1 },
    { name: "Elite Miner",    price: "5,000 Gold",  gems: "150 💎/hr",  id: 2 },
    { name: "Pro Miner",      price: "15,000 Gold", gems: "500 💎/hr",  id: 3 },
  ];

  return (
    <div className="flex flex-col h-full pb-24 p-3 pt-4 gap-3 overflow-hidden">
      {/* wallet block */}
      {!connected ? (
        <Panel py="py-5 px-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-white font-bold text-base">Wallet is not connected</p>
            <Btn onClick={() => setConnected(true)}>Connect</Btn>
          </div>
        </Panel>
      ) : (
        <Panel py="py-3 px-4">
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-green-400 font-bold text-sm">✓ Wallet connected</p>
            <p className="text-blue-300 text-xs font-mono">0x3365I...48587</p>
            <p className="text-gray-400 text-xs">Balance: <span className="text-white font-semibold">0.00 LUX</span></p>
            <button onClick={() => setConnected(false)} className="text-red-400 text-xs mt-0.5 underline">Disconnect</button>
          </div>
        </Panel>
      )}

      {/* tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(50,90,200,0.4)" }}>
        {(["owned", "shop"] as MiningTab[]).map(t => (
          <button key={t} onClick={() => setMTab(t)}
            className="flex-1 py-2.5 font-bold text-sm text-white"
            style={{
              background: mTab === t
                ? "linear-gradient(180deg,#1e52f0 0%,#0d2a95 100%)"
                : "linear-gradient(155deg,#0f2248ee 0%,#091530ee 100%)",
            }}>
            {t === "owned" ? "Owned Miners" : "Miners Shop"}
          </button>
        ))}
        <button className="px-4 text-white font-bold text-lg"
          style={{ background: "linear-gradient(155deg,#0f2248ee,#091530ee)" }}>↻</button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto">
        {mTab === "owned" ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-3">⛏️</p>
              <p className="text-blue-400/50 text-sm">{connected ? "У вас пока нет NFT-майнеров" : "Подключите кошелёк для просмотра"}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {miners.map(m => (
              <Panel key={m.id} py="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{m.name}</p>
                    <p className="text-cyan-400 text-xs mt-0.5">{m.gems}</p>
                  </div>
                  <Btn sm>{m.price}</Btn>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TASKS SCREEN
═══════════════════════════════════════════════════════ */
function TasksScreen() {
  const [claimed, setClaimed] = useState(false);

  return (
    <div className="flex flex-col h-full pb-24 p-3 pt-4 gap-3 overflow-auto">
      {/* reward */}
      <Panel py="py-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Reward:</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-white font-black text-2xl">5 000</span>
              <span style={{ fontSize: 22, filter: "drop-shadow(0 0 5px #9060ff)" }}>💎</span>
            </div>
          </div>
          <span className="text-yellow-400 text-3xl font-black mx-2"
            style={{ textShadow: "0 0 10px #c8960a" }}>»</span>
          {claimed
            ? <span className="text-green-400 font-bold text-sm">Claimed ✓</span>
            : <Btn onClick={() => setClaimed(true)}>Take</Btn>
          }
        </div>
      </Panel>

      {/* invite */}
      <Panel py="py-5 px-4">
        <div className="flex flex-col items-center gap-3">
          <p className="text-white font-bold text-sm text-center">Invite your friends and get rewards!</p>
          <Btn>Invite friend</Btn>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[
              { l: "1 friend:", v: "50.000 💎" },
              { l: "3 friends:", v: "200.000 💎" },
              { l: "5 friends:", v: "350.000 💎" },
            ].map(r => (
              <div key={r.l} className="flex flex-col items-center py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(80,120,200,0.2)" }}>
                <span className="text-blue-300 text-[11px] font-semibold">{r.l}</span>
                <span className="text-white text-[11px] font-bold mt-0.5">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* daily tasks */}
      <Panel py="py-3 px-4">
        <p className="text-white font-bold text-sm mb-2">Daily Tasks</p>
        {[
          { t: "Click 100 times",       r: "500 💎",    done: true },
          { t: "Login 7 days in a row", r: "2,000 💎",  done: false },
          { t: "Invite 1 friend",       r: "50,000 💎", done: false },
        ].map(i => (
          <div key={i.t} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2">
              <span>{i.done ? "✅" : "⬜"}</span>
              <p className="text-white text-xs">{i.t}</p>
            </div>
            <span className="text-yellow-300 text-xs font-bold">{i.r}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE SCREEN
═══════════════════════════════════════════════════════ */
function ProfileScreen() {
  const [walletOk, setWalletOk] = useState(false);

  return (
    <div className="flex flex-col h-full pb-24 overflow-auto">
      {/* avatar + name */}
      <div className="flex flex-col items-center pt-5 pb-2 px-3">
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(150deg,#1a4acc 0%,#0d2a80 100%)",
          border: "3px solid rgba(80,145,255,0.7)",
          boxShadow: "0 0 24px rgba(60,120,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34,
        }}>👤</div>
        <p className="text-white font-extrabold text-xl mt-2"
          style={{ textShadow: "0 0 14px rgba(140,200,255,0.6)" }}>LUXury_CEO</p>
      </div>

      <div className="flex flex-col gap-3 px-3">
        {/* info card */}
        <Panel py="py-4 px-4">
          <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
            {/* game account */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">Game Account:</p>
              <p className="text-green-400 font-bold text-sm">Is available</p>
            </div>
            {/* wallet */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">Wallet:</p>
              {walletOk ? (
                <>
                  <p className="text-green-400 font-bold text-sm">Is connected</p>
                  <p className="text-blue-300 text-xs font-mono mt-1">0x3365I...48587</p>
                  <p className="text-gray-400 text-xs mt-1">Balance: <span className="text-white font-semibold">—</span></p>
                </>
              ) : (
                <>
                  <p className="text-red-400 font-bold text-sm">Is not connected!</p>
                  <button onClick={() => setWalletOk(true)}
                    className="mt-1.5 px-3 py-1 text-xs font-bold text-white rounded"
                    style={{ background: "linear-gradient(180deg,#1e52f0,#0d2a95)", border: "1px solid rgba(80,145,255,0.5)" }}>
                    Connect
                  </button>
                </>
              )}
            </div>
            {/* username */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">Username:</p>
              <p className="text-white font-bold text-sm">Dim</p>
            </div>
            {/* gold */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">Gold balance:</p>
              <p className="text-white font-bold text-sm">7939</p>
            </div>
          </div>
        </Panel>

        <Btn full>Exchange</Btn>
        <Btn full>Referrals</Btn>

        {walletOk && (
          <button onClick={() => setWalletOk(false)} className="text-red-400 text-xs text-center underline">
            Disconnect wallet
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export function GameUI() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [tab, setTab] = useState<Tab>("home");

  const screens: Record<Tab, React.ReactNode> = {
    home:    <HomeScreen />,
    mining:  <MiningScreen />,
    tasks:   <TasksScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
      <div style={{
        width: 390, height: 810,
        borderRadius: 40,
        overflow: "hidden",
        position: "relative",
        border: "2px solid rgba(55,95,200,0.28)",
        boxShadow: "0 0 70px rgba(20,60,200,0.2),0 50px 120px rgba(0,0,0,0.85)",
      }}>
        <DiamondBg />

        {screen === "auth" ? (
          <AuthScreen onLogin={() => setScreen("game")} />
        ) : (
          <div style={{ position: "relative", zIndex: 10, height: "100%" }}>
            {screens[tab]}
            <BottomNav tab={tab} setTab={setTab} />
          </div>
        )}
      </div>
    </div>
  );
}
