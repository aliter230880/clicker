using System;
using UnityEngine;

[Serializable]
public class MinersSave
{
    public string wallet;
    public MinersListData[] minersLists;

    public string ToJson() => ToJson(this);
    public static string ToJson(MinersSave minersSave) => JsonUtility.ToJson(minersSave);

    public static MinersSave FromJson(string json) => JsonUtility.FromJson<MinersSave>(json);
}

[Serializable]
public class MinersListData
{
    public string tokenId;
    public MinerData[] miners;
}

[Serializable]
public class MinerData
{
    public static TimeSpan CorrectTimeSpan { get; private set; } = TimeSpan.FromSeconds(0);

    public bool isActive;
    public string lastTimeReset;

    public static void CorrectTime()
    {
        WWWForm form = new WWWForm();
        form.AddField("dateTime", (DateTime.Now).ToString());
        DatabaseNetwork.Instance.Send(form, "miners/correct-datetime.php",
            (data) =>
            {
                CorrectTimeSpan = TimeSpan.FromSeconds(double.Parse(data));
            },
            (error) =>
            {
                CorrectTimeSpan = TimeSpan.FromSeconds(0);
            });
    }

    public static double CalculateMiningGems(MinerStatsData stats, string lastTimerReset)
    {
        return CalculateMiningGems(stats, DateTime.Parse(lastTimerReset));
    }
    public static double CalculateMiningGems(MinerStatsData stats, DateTime lastTimerReset)
    {
        TimeSpan ts = (DateTime.Now - CorrectTimeSpan) - lastTimerReset;
        return stats.gemsPerDay * ts.TotalDays;
    }
}

[Serializable]
public class MinerStatsData
{

    public string tokenId;
    public double gemsPerDay;

}
