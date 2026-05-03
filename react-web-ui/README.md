# react-web-ui — LUXury Clicker React UI

  Реализация UI на React + TypeScript + Vite для P2E Telegram Mini App LUXury Clicker.  
  Блокчейн: Polygon 137, чистые JSON-RPC вызовы (без SDK-пакетов).

  ## Файлы

  | Файл | Описание |
  |---|---|
  | `LuxUI.tsx` | Главный компонент — все экраны (Home/Mining/Tasks/Profile) + WalletModal + BuyModal + blockchain logic |
  | `vite.config.ts` | Vite конфиг + SQLite mock API (gameApiPlugin) |
  | `package.json` | Зависимости: React 19, Vite 7, better-sqlite3 |

  ## Запуск (dev)

  ```bash
  cd artifacts/mockup-sandbox
  npm install
  npm run dev
  # Открыть: http://localhost:23636/__mockup/preview/game/LuxUI
  ```

  ## Контракты (Polygon 137)

  | Контракт | Адрес |
  |---|---|
  | NFT ERC1155 | `0x815AFC2bcDec02d5b0447508EE41476fFa3817FF` |
  | Marketplace | `0x289e25Ef58C00cE66eb726a8a4672B706e2f2691` |
  | LUX ERC20 | `0x7324c346b47250A3e147a3c43B7A1545D0dC0796` |
  | Seller | `0xB19aEe699eb4D2Af380c505E4d6A108b055916eB` |

  ## Цены NFT-майнеров (on-chain)

  | tokenId | Тип | Цена |
  |---|---|---|
  | 4 | Basic | 50 LUX |
  | 5 | Advanced | 100 LUX |
  | 6 | Elite | 200 LUX |
  | 7 | Pro | 500 LUX |

  ## История изменений

  - **Май 2026** — Исправлен критический баг декодирования Listing struct (неверный порядок полей Thirdweb DirectListings V3)
  - **Май 2026** — Wallet state сохраняется в sessionStorage (не сбрасывается при смене таба)
  - **Май 2026** — Скрыт нативный скроллбар (класс .lux-scroll)
  - **Май 2026** — Мгновенный переход в Marketplace после подключения кошелька
  - **Апрель 2026** — WalletModal redesign (Thirdweb-style), SmartWallet removed, raw JSON-RPC
  