using Newtonsoft.Json;
using System;

public class GameConfig
{

    public int exchangeGemsPerGold { get; private set; }
    public MinerStatsData[] minersStats { get; private set; }
    public int dailyReward { get; private set; }
    public int dailyRewardTime { get; private set; }

    public bool IsInit { get; private set; }

    public Action OnInit;

    public GameConfig()
    {
        IsInit = false;
    }

    public void Init()
    {
        DatabaseNetwork.Instance.Send(null, "miners/get-miners-config.php",
            (data) =>
            {
                Data newData = JsonConvert.DeserializeObject<Data>(data);
                exchangeGemsPerGold = newData.exchangeGemsPerGold;
                minersStats = newData.minersStats;
                dailyReward = newData.dailyReward;
                dailyRewardTime = newData.dailyRewardTime;
                IsInit = true;
                OnInit?.Invoke();
            },
            (error) =>
            {

            });
    }

    [Serializable]
    private class Data
    {
        public int exchangeGemsPerGold;
        public MinerStatsData[] minersStats;
        public int dailyReward;
        public int dailyRewardTime;
    }

}
