using System;
using System.Globalization;
using UnityEngine;

public class Saver : MonoBehaviour
{

    [SerializeField] private Game m_game;
    [SerializeField] private ClickPanel m_clickPanel;

    public static Action OnLoad;

    public static Saver Instance { get; private set; }

    public bool IsUserFirstVisit { get; private set; } = false;

    private float _saveTimer = 0;

    private int _clicksCount = 0;

    private void Awake()
    {
        Instance = this;
        TelegramApp.onRecieveUser += (user) =>
        {
            LoadScore();
        };
        _saveTimer = 1000f;
        m_clickPanel.OnClick += (eventData) =>
        {
            _clicksCount++;
        };
    }

    private void Update()
    {
        _saveTimer -= Time.deltaTime;
        if (_saveTimer <= 0f)
        {
            _saveTimer = 30f;
            AddUserClicks();
        }
    }

    public void AddUserClicks()
    {
        if (TelegramApp.Instance.user == null || _clicksCount <= 0)
        {
            _saveTimer = 5f;
            return;
        }    

        Debug.Log(_clicksCount);
        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("clicksCount", _clicksCount);
        _clicksCount = 0;
        DatabaseNetwork.Instance.Send(form, "add-user-clicks.php",
            (data) =>
            {
                m_game.SetScore(double.Parse(data, CultureInfo.InvariantCulture));
                _saveTimer = 5f;
            },
            (error) =>
            {
                _saveTimer = 5f;
            });
    }

    public void LoadScore(Action<double> callback = null)
    {
        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        DatabaseNetwork.Instance.Send(form, "get-user-score.php",
            (data) =>
            {
                double score = double.Parse(data, CultureInfo.InvariantCulture);
                m_game.SetScore(score);
                callback?.Invoke(score);
                OnLoad?.Invoke();
                _saveTimer = 5f;
            },
            (error) =>
            {
                if (error == "Incorrect telegram")
                {
                    _saveTimer = 5f;
                    IsUserFirstVisit = true;
                    OnLoad?.Invoke();
                }
            });
    }

    private void OnApplicationQuit()
    {
        AddUserClicks();
    }

}
