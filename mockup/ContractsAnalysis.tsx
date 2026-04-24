import { ExternalLink, Cpu, Layers, ShoppingCart, Coins, Wallet, ArrowRight, Shield, Users, Database } from "lucide-react";

const CHAIN = { name: "Polygon", id: 137, color: "#8b5cf6", badge: "bg-purple-900/50 border-purple-500/40 text-purple-300" };

const contracts = [
  {
    icon: Coins,
    label: "ERC-20 · LUX Token",
    address: "0x7324c346b47250A3e147a3c43B7A1545D0dC0796",
    short: "0x7324...0796",
    color: "#f59e0b",
    bg: "bg-yellow-950/40",
    border: "border-yellow-500/30",
    badge: "Главная валюта",
    badgeColor: "bg-yellow-900/60 text-yellow-300",
    role: "Внутриигровой токен LUX на Polygon. Используется для покупки NFT-майнеров через маркетплейс и обмена Gems → Gold.",
    ops: ["ERC20_BalanceOf", "ERC20_Transfer", "ERC20_Approve", "ERC20_Allowance"],
  },
  {
    icon: Layers,
    label: "ERC-1155 · Miners NFT",
    address: "0x815AFC2bcDec02d5b0447508EE41476fFa3817FF",
    short: "0x815A...17FF",
    color: "#06b6d4",
    bg: "bg-cyan-950/40",
    border: "border-cyan-500/30",
    badge: "NFT Майнеры",
    badgeColor: "bg-cyan-900/60 text-cyan-300",
    role: "Multi-token контракт. Каждый тип майнера — отдельный tokenId. NFT владелец получает Gems за время работы майнера.",
    ops: ["ERC1155_GetNFT", "ERC1155_GetOwnedNFTs", "ERC1155_BalanceOf", "ERC1155_GetAllNFTs"],
  },
  {
    icon: ShoppingCart,
    label: "Marketplace · DirectListings",
    address: "0x289e25Ef58C00cE66eb726a8a4672B706e2f2691",
    short: "0x289e...2691",
    color: "#10b981",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/30",
    badge: "Thirdweb Market",
    badgeColor: "bg-emerald-900/60 text-emerald-300",
    role: "Thirdweb DirectListings маркетплейс. Главный кошелёк (0xB19a...916eB) публикует листинги. Покупка — approve + buyFromListing.",
    ops: ["DirectListings_GetAllValidListings", "DirectListings_TotalListings", "DirectListings_BuyFromListing"],
  },
];

const flow = [
  { step: "1", icon: "📱", title: "Telegram InitData", desc: "JS-бридж Telegram.jslib вызывает GetUserInternal() → возвращает user.id, username, urlParams" },
  { step: "2", icon: "🎮", title: "Unity TelegramApp", desc: "OnRecieveMessage() парсит JSON. Событие onRecieveUser<UserData> рассылается всем слушателям." },
  { step: "3", icon: "🗄️", title: "PHP Backend", desc: "Saver → get-user-score.php (Gems). AccountNetwork → get-user.php (username, gold). Идентификатор — telegram_id." },
  { step: "4", icon: "🔗", title: "Wallet AutoConnect", desc: "ThirdwebNetwork → get-last-wallet-session.php. Если сессия есть — авто-восстановление через Thirdweb SDK." },
  { step: "5", icon: "⛓️", title: "On-chain данные", desc: "После коннекта кошелька — ERC20_BalanceOf (LUX баланс), ERC1155_GetOwnedNFTs (майнеры игрока)." },
];

const issues = [
  { sev: "crit", text: "ValueToWei использует запятую как разделитель — токены конвертируются неверно на большинстве устройств" },
  { sev: "crit", text: "WWW (deprecated) вместо UnityWebRequest — может сломаться в новых билдах Unity" },
  { sev: "warn", text: "async void в ConnectWallet/Disconnect — исключения теряются, нет обработки ошибок транзакций" },
  { sev: "warn", text: "Race condition: _clicksCount обнуляется до ответа сервера → потеря кликов при сбое сети" },
];

const sevCfg = {
  crit: { label: "КРИТИЧНО", cls: "bg-red-500 text-white" },
  warn: { label: "ВЫСОКИЙ",  cls: "bg-orange-500 text-white" },
};

export function ContractsAnalysis() {
  return (
    <div className="min-h-screen bg-[#080d18] text-white font-sans p-5 overflow-auto">
      <div className="max-w-2xl mx-auto">

        {/* header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-purple-400 text-xs font-mono uppercase tracking-widest">Blockchain Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Смарт-контракты & Аккаунт</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-900/50 border border-purple-500/40 text-purple-300">
              Polygon · Chain ID 137
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900/50 border border-blue-500/40 text-blue-300">
              Thirdweb SDK
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 border border-slate-600/40 text-slate-300">
              WalletConnect
            </span>
          </div>
        </div>

        {/* contracts */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Контракты
          </p>
          <div className="flex flex-col gap-3">
            {contracts.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.address} className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white font-bold text-sm">{c.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.badgeColor}`}>{c.badge}</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-2 leading-relaxed">{c.role}</p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <code className="text-xs font-mono" style={{ color: c.color }}>{c.address}</code>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.ops.map(op => (
                          <span key={op} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                            {op}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* account connection flow */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Как подключается аккаунт игрока
          </p>
          <div className="flex flex-col gap-2">
            {flow.map((f, i) => (
              <div key={f.step} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1a3a80, #0d1e50)", border: "1px solid rgba(80,120,220,0.4)" }}
                  >
                    {f.icon}
                  </div>
                  {i < flow.length - 1 && <div className="w-px h-4 bg-slate-700 mt-1" />}
                </div>
                <div className="pb-1">
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* critical issues */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Критичные проблемы в blockchain-слое
          </p>
          <div className="flex flex-col gap-2">
            {issues.map((issue, i) => {
              const cfg = sevCfg[issue.sev as keyof typeof sevCfg];
              return (
                <div key={i} className="flex items-start gap-2.5 bg-slate-900/60 rounded-xl p-3 ring-1 ring-slate-700/50">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${cfg.cls}`}>{cfg.label}</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{issue.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* main wallet note */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/40 ring-1 ring-slate-700/40 flex items-start gap-2.5">
          <Wallet className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-400 text-xs font-semibold mb-0.5">Главный кошелёк проекта</p>
            <code className="text-slate-300 text-xs font-mono">0xB19aEe699eb4D2Af380c505E4d6A108b055916eB</code>
            <p className="text-slate-500 text-xs mt-1">Публикует листинги на маркетплейсе. Получает LUX-токены за продажу NFT-майнеров.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
