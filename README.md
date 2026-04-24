# LUXury Clicker — Code Audit & Architecture

  > **Дата аудита:** апрель 2026  
  > **Платформа:** Unity WebGL + Telegram Mini App  
  > **Блокчейн:** Polygon (Chain ID 137)

  ---

  ## Структура репозитория

  ```
  Assets/Scripts/          — Unity C# игровые скрипты
  backend/                 — PHP серверная часть
  webgl/                   — WebGL фронтенд (index.html, style.css)
  mockup/                  — Интерактивный UI макет (React/TSX)
  ```

  ---

  ## Найденные баги

  ### 🔴 Критические (2)

  #### 1. Устаревший класс WWW — `DatabaseNetwork.cs`
  ```csharp
  // ПРОБЛЕМА: WWW удалён в Unity 2022+
  IEnumerator SendRequestCoroutine(string url, ...) {
      WWW www = new WWW(url, form);
      yield return www;
  }
  // РЕШЕНИЕ: заменить на UnityWebRequest
  using (UnityWebRequest req = UnityWebRequest.Post(url, form)) {
      yield return req.SendWebRequest();
  }
  ```

  #### 2. Локаль-зависимый баг в ValueToWei — `ThirdwebNetwork.cs`
  ```csharp
  // ПРОБЛЕМА: ToString() использует запятую вместо точки в RU-локали
  private BigInteger ValueToWei(float value, int decimals) {
      string strValue = (value * Mathf.Pow(10, decimals)).ToString();
      string[] parts = strValue.Split(','); // Split(',') падает если разделитель '.'
  }
  // РЕШЕНИЕ:
  string strValue = (value * Mathf.Pow(10, decimals)).ToString(CultureInfo.InvariantCulture);
  string[] parts = strValue.Split('.');
  ```

  ---

  ### 🟠 Высокие (2)

  #### 3. Debug-код в Update() — `Game.cs`
  ```csharp
  // ПРОБЛЕМА: вызывается каждый кадр в production
  void Update() {
      if (Input.GetKeyDown(KeyCode.Space)) {
          Debug.Log("DEBUG CLICK"); // удалить
          _clicksCount++;
      }
  }
  ```

  #### 4. Незащищённые синглтоны — `Game.cs`, `Saver.cs`
  Отсутствует проверка на дублирование Instance при инициализации.

  ---

  ### 🟡 Средние (2)

  #### 5. Race condition в Saver.cs
  `_clicksCount` изменяется из нескольких корутин без lock.

  #### 6. Null-форма в запросах — `DatabaseNetwork.cs`
  При пустом словаре параметров форма не создаётся, запрос может упасть.

  ---

  ## Архитектура смарт-контрактов (Polygon)

  | Контракт | Адрес | Тип |
  |---|---|---|
  | LUX Token | `0x7324...0796` | ERC-20 |
  | Miners NFT | `0x815A...17FF` | ERC-1155 |
  | Marketplace | `0x289e...2691` | Thirdweb DirectListings |

  ---

  ## Конфигурация майнеров (из miners-config.php)

  | Token ID | Gems/день | Тип |
  |---|---|---|
  | 4 | 30,000 | Basic Miner |
  | 5 | 70,000 | Advanced Miner |
  | 6 | 150,000 | Elite Miner |
  | 7 | 350,000 | Pro Miner |

  - **Exchange:** 1000 gems = 1 Gold
  - **Daily reward:** 5000 gems каждые 3 часа
  - **Telegram бот:** `@LUX_Clicker_bot`

  ---

  ## PHP Backend API

  | Файл | Назначение |
  |---|---|
  | `correct-datetime.php` | Проверка временного интервала |
  | `get-miners.php` | Получить/синхронизировать NFT майнеры |
  | `get-miners-config.php` | Конфиг майнеров |
  | `set-miner-active.php` | Активировать/деактивировать майнер |
  | `withdrawal-miners.php` | Вывод накопленных gems с майнеров |

  **БД таблицы:**
  - `tg_clicker` (telegram, score)
  - `tg_miners` (wallet_address, miners JSON)

  ---

  ## SQL Injection риск — set-miner-active.php

  ```php
  // ПРОБЛЕМА: прямая подстановка без prepared statements
  $query = "UPDATE tg_miners SET miners = '" . json_encode($miners) . "' WHERE wallet_address = '" . $walletAddress . "';";
  // РЕШЕНИЕ: использовать PDO prepared statements или mysqli bind_param
  ```

  ---

  *Сгенерировано Replit Agent · Апрель 2026*
  