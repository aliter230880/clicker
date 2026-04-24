using System;
using UnityEngine;

public class Game : MonoBehaviour
{

    public const string CURRENCY_NAME = "Gem";

    public double Score { get; private set; }

    public static GameConfig Config = new GameConfig();

    public Action<double> OnScoreChanged;

    public double GetGemsBalance() => Score;

    private void Awake()
    {
        Config.Init();
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.R))
        {
            WWWForm form = new WWWForm();
            form.AddField("walletAddress", "WalletAddress");
            form.AddField("minerId", "5");
            form.AddField("minerIndex", "2");
            form.AddField("active", "true");
            DatabaseNetwork.Instance.Send(form, "miners/get-miners.php",
                (data) =>
                {

                },
                (error) =>
                {

                });
        }
    }

    public void SetScore(double score)
    {
        if (score <= 0)
            return;
        Score = score;
        OnScoreChanged?.Invoke(Score);
    }

    public void AddScore(double value)
    {
        if (value <= 0)
            return;
        Score += value;
        OnScoreChanged?.Invoke(Score);
    }

    public void MinusScore(double value)
    {
        if (value <= 0)
            return;
        Score -= value;
        OnScoreChanged?.Invoke(Score);
    }

    public void OpenGameInBrowser()
    {
        OpenUrl(DatabaseNetwork.Instance.Url);
    }

    public void OpenUrl(string url)
    {
        Application.OpenURL(url);
    }

}
