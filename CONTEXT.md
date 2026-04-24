# CONTEXT.md — LUXury Clicker · Полный контекст проекта

  > Создан: апрель 2026  
  > Статус: **в производстве** (работает на https://clicker.aliterra.space/)  
  > Версия Unity: WebGL Build (Builds.wasm + Builds.framework.js + Builds.data)

  ---

  ## 1. ЧТО ЭТО ЗА ПРОЕКТ

  **LUXury Clicker** — P2E (play-to-earn) кликер-игра, работающая как Telegram Mini App.  
  Игра написана на C# в Unity, собрана в WebGL и размещена на сервере.  
  Игровая экономика завязана на блокчейне Polygon: токен LUX (ERC-20) и NFT-майнеры (ERC-1155).

  **Суть геймплея:**
  1. Пользователь входит через Telegram
  2. Тапает по кристаллу — зарабатывает Gems
  3. Покупает NFT-майнеров за LUX токены — они пассивно генерируют Gems
  4. Gems обменивает на Gold (1000:1)
  5. Приглашает друзей — получает бонусы

  ---

  ## 2. АРХИТЕКТУРА

  ```
  ┌─────────────────────────────────────────────────────────┐
  │                    TELEGRAM CLIENT                       │
  │                 (Mini App Browser)                       │
  └──────────────────────┬──────────────────────────────────┘
                         │ Telegram WebApp API
  ┌──────────────────────▼──────────────────────────────────┐
  │              WEB SERVER (clicker.aliterra.space)         │
  │  ┌─────────────────────────────────────────────────┐    │
  │  │  index.html — WebGL loader + Telegram Auth gate  │    │
  │  │  Telegram Widget → LUX_Clicker_bot              │    │
  │  │  Unity WebGL Build (Builds.wasm, .data, .js)    │    │
  │  └─────────────────────────────────────────────────┘    │
  │  ┌─────────────────────────────────────────────────┐    │
  │  │  PHP Backend (/miners/ folder)                   │    │
  │  │  MySQL Database                                  │    │
  │  └─────────────────────────────────────────────────┘    │
  └──────────────────────┬──────────────────────────────────┘
                         │ Thirdweb SDK + WalletConnect
  ┌──────────────────────▼──────────────────────────────────┐
  │                  POLYGON (Chain ID 137)                  │
  │  LUX Token ERC-20      0x7324...0796                    │
  │  Miners NFT ERC-1155   0x815A...17FF                    │
  │  Marketplace           0x289e...2691  (Thirdweb)         │
  │  Main Wallet           0xB19a...916eB                    │
  └─────────────────────────────────────────────────────────┘
  ```

  ---

  ## 3. СТРУКТУРА РЕПОЗИТОРИЯ

  ```
  Assets/Scripts/
  ├── Game.cs                      # Главный игровой объект, Score, AddScore
  ├── GameConfig.cs                # Загружает конфиг с сервера (обмен, майнеры)
  ├── Saver.cs                     # Автосохранение кликов (каждые 30 сек + выход)
  ├── ClickPanel.cs                # Обработка тапа по кристаллу
  ├── ClickerProtect.cs            # Защита от читов (проверка скорости кликов)
  ├── DatabaseNetwork.cs           # HTTP-клиент для PHP API
  │
  ├── Account/
  │   ├── AccountNetwork.cs        # Загрузка/сохранение профиля пользователя
  │   └── UserData.cs              # Модель данных пользователя
  │
  ├── Telegram/
  │   └── TelegramApp.cs           # JS interop: получение данных Telegram юзера
  │
  ├── Thirdweb/
  │   ├── ThirdwebNetwork.cs       # Кошелёк, подключение, LUX баланс, ValueToWei
  │   ├── NFTMarketplace.cs        # ERC-1155 NFT + DirectListings маркетплейс
  │   └── UI/
  │       ├── NFTField.cs          # Карточка NFT в UI
  │       ├── ThirdwebModalPanel.cs # Попап подключения кошелька
  │       └── ThirdwebUI.cs        # Управление состоянием UI кошелька
  │
  ├── Mining/
  │   ├── MinerStatsData.cs        # Модель данных майнера (tokenId, gemsPerDay)
  │   └── UI/
  │       ├── MinerField.cs        # Карточка майнера в списке
  │       ├── MinerInfoPanel.cs    # Панель деталей майнера
  │       ├── MinerPurchaseField.cs # UI покупки майнера
  │       ├── MinersList.cs        # Список всех майнеров
  │       ├── MinerWorkSwitch.cs   # Переключатель активности майнера
  │       └── MiningPanel.cs       # Главная панель Mining таба
  │
  ├── Tasks/
  │   ├── DailyReward.cs           # Ежедневная награда (5000 gems / 3 часа)
  │   └── InviteFriendsTask.cs     # Реферальная система
  │
  ├── Referrals/
  │   ├── ActivateReferralCodePopup.cs
  │   ├── ReferralCodePanel.cs
  │   └── ReferralsPanel.cs
  │
  ├── UI/
  │   ├── FlyText.cs / FlyTextSpawner.cs  # Анимация текста при тапе
  │   ├── GameInterface.cs         # Главный UI контроллер
  │   ├── Popups.cs                # Попапы
  │   ├── SwitchUI.cs              # Переключатель элементов UI
  │   ├── TabButton.cs / TabGroup.cs / TabPanels.cs  # Таб-навигация
  │   └── Profile/
  │       ├── ExchangePanel.cs     # Обмен Gems → Gold
  │       └── ProfilePanel.cs      # Профиль пользователя
  │
  └── Helps/
      ├── GroupsUpdater.cs         # Batch-обновление групп UI
      ├── Icons.cs                 # Хранилище иконок
      └── ObjectPool.cs            # Пул объектов для оптимизации

  backend/                         # PHP серверная часть
  ├── correct-datetime.php         # Проверка временного интервала
  ├── get-miners.php               # Синхронизация NFT майнеров
  ├── get-miners-config.php        # Конфиг майнеров
  ├── miners-config.php            # Константы конфига
  ├── set-miner-active.php         # Активация/деактивация майнера
  └── withdrawal-miners.php        # Вывод накопленных gems

  webgl/                           # WebGL фронтенд
  ├── index.html                   # Загрузчик Unity + Telegram auth
  └── TemplateData/style.css       # Стили загрузочного экрана

  mockup/                          # Интерактивный UI прототип (React/TSX)
  ├── GameUI.tsx                   # Полный макет игры (Auth, Home, Mining, Tasks, Profile)
  ├── ContractsAnalysis.tsx        # Визуализация смарт-контрактов
  └── LuxUI.tsx                    # Люкс-редизайн (glassmorphism, neon, canvas crystal keying)
  ```

  ---

  ## 4. СМАРТ-КОНТРАКТЫ (Polygon Mainnet)

  | Контракт | Адрес | Стандарт | Назначение |
  |---|---|---|---|
  | **LUX Token** | `0x7324c346b47250A3e147a3c43B7A1545D0dC0796` | ERC-20 | Игровая валюта для покупки NFT |
  | **Miners NFT** | `0x815AFC2bcDec02d5b0447508EE41476fFa3817FF` | ERC-1155 | NFT-майнеры (токены 4, 5, 6, 7) |
  | **Marketplace** | `0x289e25Ef58C00cE66eb726a8a4672B706e2f2691` | Thirdweb DirectListings | Продажа NFT за LUX токены |
  | **Main Wallet** | `0xB19aEe699eb4D2Af380c505E4d6A108b055916eB` | EOA | Кошелёк-владелец листингов |

  ### Флоу покупки NFT-майнера:
  ```
  1. Пользователь → ERC20_Allowance() → проверить разрешение
  2. Если allowance < цена → ERC20_Approve(marketplace, amount)
  3. Marketplace_DirectListings_BuyFromListing(listingId, buyer, 1, LUX, price)
  4. NFT переходит к покупателю, LUX уходит продавцу
  ```

  ---

  ## 5. КОНФИГУРАЦИЯ ИГРЫ (miners-config.php)

  | Параметр | Значение |
  |---|---|
  | **Обмен** | 1000 Gems = 1 Gold |
  | **Daily Reward** | 5 000 Gems |
  | **Cooldown награды** | 3 часа (10 800 секунд) |
  | **Telegram бот** | @LUX_Clicker_bot |

  ### NFT Майнеры:

  | Token ID | Название | Gems/день | 
  |---|---|---|
  | 4 | Basic Miner | 30 000 |
  | 5 | Advanced Miner | 70 000 |
  | 6 | Elite Miner | 150 000 |
  | 7 | Pro Miner | 350 000 |

  ---

  ## 6. БАЗА ДАННЫХ

  ### Таблица `tg_clicker`
  | Поле | Тип | Описание |
  |---|---|---|
  | `telegram` | VARCHAR | Telegram ID пользователя |
  | `score` | BIGINT | Количество Gems |

  ### Таблица `tg_miners`
  | Поле | Тип | Описание |
  |---|---|---|
  | `wallet_address` | VARCHAR | Адрес кошелька Polygon |
  | `miners` | JSON | Массив майнеров с их состоянием |

  ### Структура JSON поля `miners`:
  ```json
  [
    {
      "tokenId": "5",
      "miners": [
        { "isActive": true,  "lastTimeReset": "2026-04-24 10:00:00" },
        { "isActive": false, "lastTimeReset": "2026-04-24 10:00:00" }
      ]
    }
  ]
  ```

  ---

  ## 7. PHP API ENDPOINTS

  ### GET /miners/get-miners-config.php
  - Метод: POST (без параметров)
  - Возвращает: JSON конфиг (обменный курс, список майнеров, daily reward)

  ### POST /miners/get-miners.php
  | Параметр | Описание |
  |---|---|
  | `walletAddress` | Адрес кошелька |
  | `nftMiners` | JSON массив NFT из блокчейна (или "-" если не нужна синхронизация) |
  - Синхронизирует список майнеров в БД с реальными NFT из блокчейна
  - Возвращает актуальный список майнеров со статусами

  ### POST /miners/set-miner-active.php
  | Параметр | Описание |
  |---|---|
  | `walletAddress` | Адрес кошелька |
  | `minerId` | Token ID (4/5/6/7) |
  | `minerIndex` | Порядковый номер майнера |
  | `active` | true/false |
  - Включает/выключает конкретного майнера
  - При активации сбрасывает lastTimeReset

  ### POST /miners/withdrawal-miners.php
  | Параметр | Описание |
  |---|---|
  | `telegram` | Telegram ID |
  | `walletAddress` | Адрес кошелька |
  | `nftMiners` | JSON массив NFT из блокчейна |
  - Считает накопленные Gems по всем активным майнерам
  - Формула: `gemsPerDay × (текущееВремя - lastTimeReset) / 86400`
  - Добавляет Gems к score пользователя
  - Сбрасывает lastTimeReset

  ### POST /correct-datetime.php
  | Параметр | Описание |
  |---|---|
  | `dateTime` | Дата-время для проверки |
  - Возвращает разницу в секундах между переданным временем и сейчас
  - Используется для проверки cooldown daily reward

  ---

  ## 8. НАЙДЕННЫЕ БАГИ И УЯЗВИМОСТИ

  ### 🔴 КРИТИЧЕСКИЕ

  #### БАГ #1 — Устаревший класс WWW (DatabaseNetwork.cs)
  **Файл:** `Assets/Scripts/DatabaseNetwork.cs`, метод `Sending()`  
  **Проблема:** Unity удалил класс `WWW` в версии 2022+. Код использует его вместо `UnityWebRequest`. Правильный вариант закомментирован прямо в том же файле!
  ```csharp
  // ТЕКУЩИЙ КОД (сломан в Unity 2022+):
  WWW www = new WWW(Url + m_sqlPrefix + "/" + fileName, form);
  yield return www;
  if (string.IsNullOrEmpty(www.error)) { ... }

  // ПРАВИЛЬНЫЙ КОД (закомментирован выше в том же файле):
  UnityWebRequest request = UnityWebRequest.Post(Url + m_sqlPrefix + "/" + fileName, form);
  request.SetRequestHeader("Access-Control-Allow-Origin", "*");
  yield return request.SendWebRequest();
  if (string.IsNullOrEmpty(request.error)) { ... }
  ```
  **Решение:** Раскомментировать правильный метод, удалить старый.

  #### БАГ #2 — Локаль в ValueToWei (ThirdwebNetwork.cs)
  **Файл:** `Assets/Scripts/Thirdweb/ThirdwebNetwork.cs`, метод `ValueToWei()`  
  **Проблема:** `float.ToString()` использует локаль системы. В русской локали разделитель "," вместо ".". Метод делает `Split(',')` — падает если локаль английская, и наоборот.
  ```csharp
  // ПРОБЛЕМА:
  string strValue = (value * Mathf.Pow(10, decimals)).ToString();
  string[] parts = strValue.Split(','); // падает в en-локали

  // РЕШЕНИЕ:
  using System.Globalization;
  string strValue = (value * Mathf.Pow(10, decimals)).ToString(CultureInfo.InvariantCulture);
  string[] parts = strValue.Split('.'); // всегда точка
  ```
  **Последствия:** Неверная сумма в транзакции с LUX токенами — может списать неправильное количество или упасть.

  ---

  ### 🟠 ВЫСОКИЕ

  #### БАГ #3 — Debug-код в Update() (Game.cs)
  **Файл:** `Assets/Scripts/Game.cs`, метод `Update()`  
  **Проблема:** В production-сборке активен отладочный код — нажатие R отправляет запрос к серверу.
  ```csharp
  void Update() {
      if (Input.GetKeyDown(KeyCode.R)) {  // Срабатывает каждый кадр
          WWWForm form = new WWWForm();
          form.AddField("walletAddress", "WalletAddress"); // хардкод адреса!
          form.AddField("minerId", "5");
          form.AddField("minerIndex", "2");
          form.AddField("active", "true");
          DatabaseNetwork.Instance.Send(form, "miners/get-miners.php", ...); // реальный запрос!
      }
  }
  ```
  **Решение:** Удалить полностью или обернуть в `#if UNITY_EDITOR`.

  #### БАГ #4 — Незащищённый синглтон (Saver.cs)
  **Файл:** `Assets/Scripts/Saver.cs`, метод `Awake()`  
  **Проблема:** Нет проверки на дублирование экземпляра.
  ```csharp
  // ТЕКУЩИЙ КОД:
  private void Awake() {
      Instance = this; // перезаписывает без проверки!
      ...
  }

  // ПРАВИЛЬНО:
  private void Awake() {
      if (Instance != null && Instance != this) { Destroy(gameObject); return; }
      Instance = this;
      DontDestroyOnLoad(gameObject);
      ...
  }
  ```

  ---

  ### 🟡 СРЕДНИЕ

  #### БАГ #5 — Race condition в Saver.cs
  **Файл:** `Assets/Scripts/Saver.cs`  
  **Проблема:** `_clicksCount` изменяется из `OnClick` (синхронно) и читается/сбрасывается в корутине `AddUserClicks` (асинхронно). Возможна потеря кликов.
  ```csharp
  // Потенциально опасно:
  m_clickPanel.OnClick += (eventData) => { _clicksCount++; }; // из UI потока
  // А в корутине:
  int count = _clicksCount;
  _clicksCount = 0; // сброс без синхронизации
  ```

  #### БАГ #6 — Null WWWForm в запросах (GameConfig.cs)
  **Файл:** `Assets/Scripts/GameConfig.cs`, строка инициализации  
  **Проблема:** Передаётся `null` вместо `WWWForm` в метод `Send()`. Метод `Sending()` создаёт `new WWW(url, null)` — поведение не определено.
  ```csharp
  DatabaseNetwork.Instance.Send(null, "miners/get-miners-config.php", ...);
  // Нужно:
  DatabaseNetwork.Instance.Send(new WWWForm(), "miners/get-miners-config.php", ...);
  ```

  ---

  ### 🚨 БЕЗОПАСНОСТЬ (PHP Backend)

  #### УЯЗВИМОСТЬ — SQL Injection (set-miner-active.php + withdrawal-miners.php)
  **Файлы:** `backend/set-miner-active.php`, `backend/withdrawal-miners.php`  
  **Проблема:** Прямая подстановка пользовательского ввода в SQL без подготовленных запросов.
  ```php
  // ОПАСНО:
  $query = "UPDATE tg_miners SET miners = '" . json_encode($miners) . 
           "' WHERE wallet_address = '" . $walletAddress . "';";
  mysqli_query($db->con, $query);

  // БЕЗОПАСНО (PDO):
  $stmt = $pdo->prepare("UPDATE tg_miners SET miners = ? WHERE wallet_address = ?");
  $stmt->execute([json_encode($miners), $walletAddress]);
  ```
  **Риск:** Атакующий может передать в `walletAddress` SQL-инъекцию и получить/изменить данные любого пользователя.

  ---

  ## 9. КЛЮЧЕВЫЕ ТЕХНИЧЕСКИЕ РЕШЕНИЯ

  ### Telegram Auth Flow
  ```
  Браузер → window.Telegram.WebApp.initDataUnsafe.user
         ├── Есть данные (Mini App) → onTelegramAuth(user) напрямую
         └── Нет данных (браузер) → показать Telegram Login Widget (@LUX_Clicker_bot)
                                  → пользователь нажимает → onTelegramAuth(user)
  ```

  ### Unity ↔ JavaScript Bridge
  ```javascript
  // JS → Unity: SendMessage("ObjectName", "MethodName", data)
  unityInstance.SendMessage("TelegramApp", "OnRecieveMessage", JSON.stringify({
    type: "userData",
    message: JSON.stringify(userData)
  }));

  // Unity → JS: [DllImport("__Internal")] extern void GetUserInternal();
  // Реализован в jslib файле внутри WebGL билда
  ```

  ### Сохранение прогресса
  - Автосохранение каждые 30 секунд (`Saver.cs`)
  - Принудительное сохранение при закрытии (`window.onbeforeunload → SendMessage("Saver", "AddUserClicks")`)

  ---

  ## 10. ЧТО МОЖНО МЕНЯТЬ БЕЗ UNITY

  | Что | Файл | Можно без Unity |
  |---|---|---|
  | Telegram auth логика | `webgl/index.html` | ✅ |
  | Конфиг майнеров | `backend/miners-config.php` | ✅ |
  | SQL-инъекция фикс | `backend/*.php` | ✅ |
  | Daily reward время | `backend/miners-config.php` | ✅ |
  | Gems/день майнеров | `backend/miners-config.php` | ✅ |
  | Стили загрузочного экрана | `webgl/TemplateData/style.css` | ✅ |
  | Внутриигровой UI | Unity Scenes/Prefabs | ❌ нужен Unity |
  | Логика тапа, счётчики | C# Scripts (.wasm) | ❌ нужен Unity |
  | Баги в C# (WWW, ValueToWei) | Rebuild нужен | ❌ нужен Unity |

  ---

  ## 11. ПЛАН ИСПРАВЛЕНИЙ (приоритеты)

  ### Срочно (без Unity):
  1. **SQL Injection** → переписать UPDATE запросы на PDO prepared statements
  2. **miners-config.php** → можно изменить баланс геймплея (геймдизайн)

  ### При следующей сборке Unity:
  1. **DatabaseNetwork.cs** → раскомментировать UnityWebRequest, удалить WWW
  2. **ThirdwebNetwork.cs** → добавить CultureInfo.InvariantCulture в ValueToWei
  3. **Game.cs** → удалить debug-код из Update() или обернуть в #if UNITY_EDITOR
  4. **Saver.cs** → добавить проверку Instance в Awake()
  5. **GameConfig.cs** → передавать new WWWForm() вместо null

  ### Долгосрочно:
  - Перевести игровую логику на чистый веб-стек (React + TypeScript + Thirdweb SDK)
  - Это позволит обновлять игру без пересборки в Unity

  ---

  ## 12. ТЕХНОЛОГИИ

  | Компонент | Технология |
  |---|---|
  | Игровой движок | Unity (WebGL Export) |
  | Язык | C# (.NET Standard 2.1) |
  | Блокчейн SDK | Thirdweb Unity SDK |
  | Кошелёк | WalletConnect |
  | Сеть | Polygon (MATIC), Chain ID 137 |
  | Бэкенд | PHP + MySQL |
  | Фронтенд-обёртка | Vanilla HTML/JS |
  | Telegram | Mini App API + Login Widget |
  | Маркетплейс | Thirdweb DirectListings |
  | Прототип UI | React + TypeScript + Tailwind |

  ---

  *Документ сгенерирован Replit Agent · Апрель 2026*  
  *Репозиторий: https://github.com/aliter230880/clicker*

  ---

  ## 9. LUXURY WEB-STACK РЕДИЗАЙН (LuxUI.tsx)

    > Создан: апрель 2026  
    > Файл: `artifacts/mockup-sandbox/src/components/mockups/game/LuxUI.tsx`  
    > Превью: Vite mockup-sandbox (canvas iframe на канвасе, shape id: lux-ui)

    ### Стек и визуальная система:
    - **React + TypeScript** — полностью без внешних UI-библиотек
    - **Glassmorphism** — `backdrop-filter: blur(24-32px) saturate(180-200%)` на всех панелях
    - **Анимированные блобы** — три жидкостных радиальных градиента (cyan/purple/gold), CSS keyframes
    - **Сетка-хейз** — 60px grid overlay поверх фона для глубины
    - **Neon glow** — `text-shadow` и `box-shadow` с `rgba(0,212,255,...)` и `rgba(124,58,237,...)`
    - **Shimmer-текст** — анимированный градиент на балансе gems и кнопке Daily Reward

    ### Кристалл (canvas luma-key):
    - Оригинальный анимированный кристалл из игры загружается как `crystal.webm`
    - Поскольку webm не содержит альфа-канала, применяется **попиксельное удаление фона**:
      - Скрытый `<video>` + видимый `<canvas>` рисуются через `requestAnimationFrame`
      - Для каждого пикселя: `lum = 0.299R + 0.587G + 0.114B`
      - `lum < 20` → alpha = 0 (прозрачно)
      - `lum 20–55` → плавное затухание (мягкий край)
      - `lum > 55` → оригинальный пиксель кристалла
    - Результат: кристалл парит без квадратного фона

    ### Экраны (4 таба):
    | Таб | Содержимое |
    |---|---|
    | **Home** | Счётчик gems, тап по кристаллу (+1 fly-text), кольца-орбиты |
    | **Mining** | Кошелёк (connect/disconnect), shop NFT-майнеров #4–7, owned список |
    | **Tasks** | Daily Reward 5000 gems (3ч cooldown), реферальная система |
    | **Profile** | Обмен 1000 gems → 1 Gold, Telegram профиль, статистика |

    ### Цветовая палитра:
    | Цвет | HEX | Применение |
    |---|---|---|
    | Нео-голубой | `#00d4ff` | Основной акцент, кнопки, активные табы |
    | Фиолетовый | `#7c3aed → #a855f7` | Градиенты, блобы |
    | Shimmer-золото | `#ffd700 / #c9a227` | Daily Reward, score |
    | Розовый неон | `#ff4cf2` | Pro Miner (tokenId 7) |

    ### Ресурсы (public/):
    - `crystal.webm` — анимированный кристалл из реального геймплея (7.1 MB)
  