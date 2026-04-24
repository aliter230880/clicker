using System;
using System.Collections;
using TMPro;
using UnityEngine;

public class DailyReward : MonoBehaviour
{

    [SerializeField] private TMP_Text m_rewardText;
    [SerializeField] private TMP_Text m_timerText;
    [SerializeField] private GameObject m_takeButton;

    private DateTime _lastTakeReward;

    private void Start()
    {
        if (TelegramApp.Instance.user == null)
            TelegramApp.onRecieveUser += Init;
        else
            Init(TelegramApp.Instance.user);
    }

    private void OnEnable()
    {
        StartCoroutine(TimerUpdater());
        UpdateUI();
    }

    public void TakeReward()
    {
        if (TelegramApp.Instance.user == null)
            return;

        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        DatabaseNetwork.Instance.Send(form, "take-daily-reward.php",
            (data) =>
            {
                if (string.IsNullOrEmpty(data))
                    _lastTakeReward = new DateTime();
                else
                    _lastTakeReward = DateTime.Parse(data);
                Saver.Instance.LoadScore();
            },
            (error) =>
            {

            });
    }

    private void Init(TelegramApp.UserData user)
    {
        WWWForm form = new WWWForm();
        form.AddField("telegram", user.id);
        DatabaseNetwork.Instance.Send(form, "get-last-reward-time.php",
            (data) =>
            {
                if (string.IsNullOrEmpty(data))
                    _lastTakeReward = new DateTime();
                else
                    _lastTakeReward = DateTime.Parse(data);
            },
            (error) =>
            {

            });
    }

    private void UpdateUI()
    {
        m_rewardText.text = Game.Config.dailyReward + Icons.Gem;
    }

    private void UpdateTimer()
    {
        TimeSpan ts = DateTime.Now - _lastTakeReward;
        if (ts.TotalSeconds >= Game.Config.dailyRewardTime)
        {
            m_timerText.gameObject.SetActive(false);
            m_takeButton.SetActive(true);
        }
        else
        {
            float timeLeft = Game.Config.dailyRewardTime - (float)ts.TotalSeconds;
            int hours = (int)timeLeft / 3600;
            int minutes = ((int)timeLeft - hours * 3600) / 60;
            int seconds = (int)timeLeft - minutes * 60 - hours * 3600;
            m_timerText.text = "next in:\n";
            if (hours > 0)
                m_timerText.text += $"{hours}:{(minutes < 10 ? "0" : "")}{minutes}";
            else if (minutes > 0)
                m_timerText.text += $"{minutes} min.";
            else
                m_timerText.text += $"{seconds} sec.";

            m_timerText.gameObject.SetActive(true);
            m_takeButton.SetActive(false);
        }
    }

    private IEnumerator TimerUpdater()
    {
        while (true)
        {
            UpdateTimer();
            yield return new WaitForSeconds(0.5f);
        }
    }

}
