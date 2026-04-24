using AccountSystem;
using TMPro;
using UnityEngine;

public class ExchangePanel : MonoBehaviour
{

    [SerializeField] private TMP_Text m_balanceText;
    [SerializeField] private TMP_Text m_goldBalanceText;
    [SerializeField] private TMP_Text m_exchangeGemsPerGoldText;
    [Space]
    [SerializeField] private GameObject m_exchangePanel;
    [SerializeField] private GameObject m_noAccountPanel;
    [Space]
    [SerializeField] private TMP_InputField m_exchangeValueInputField;
    [SerializeField] private TMP_Text m_exchangeGold;
    [SerializeField] private GameObject m_exchangeButton;
    [SerializeField] private GameObject m_loadingPanel;
    [SerializeField] private FlyText m_errorText;
    [SerializeField] private Transform m_errorTextSpawnPoint;
    [Space]
    [SerializeField] private Game m_game;

    private int _exchangeGemsPerGold => Game.Config.IsInit ? Game.Config.exchangeGemsPerGold : int.MaxValue;

    private void Start()
    {
        m_exchangeValueInputField.onValueChanged.AddListener(OnInputValueChanged);
    }

    private void OnEnable()
    {
        m_exchangeGemsPerGoldText.text = $"{_exchangeGemsPerGold}{Icons.Gem}";
        SetLoading(false);
        UpdateBalance();
    }

    public void Exchange()
    {
        if (AccountNetwork.Instance.userData == null)
        {
            m_errorText.Spawn(m_errorTextSpawnPoint.position, "Game Account isn't connected!");
            return;
        }

        double gemsValue = 0;
        if (double.TryParse(m_exchangeValueInputField.text, out gemsValue) == false)
        {
            m_errorText.Spawn(m_errorTextSpawnPoint.position, "Wrong value!");
            return;
        }

        if (gemsValue <= 0)
        {
            m_errorText.Spawn(m_errorTextSpawnPoint.position, "Wrong value!");
            return;
        }
        else if (gemsValue < _exchangeGemsPerGold)
        {
            m_errorText.Spawn(m_errorTextSpawnPoint.position, $"Min gems amount {_exchangeGemsPerGold}");
            return;
        }
        else if (gemsValue > m_game.GetGemsBalance())
        {
            m_errorText.Spawn(m_errorTextSpawnPoint.position, "Not enough balance!");
            return;
        }

        SetLoading(true);
        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("value", gemsValue.ToString());
        DatabaseNetwork.Instance.Send(form, "gold-exchange.php",
            (data) =>
            {
                SetLoading(false);
                m_exchangeValueInputField.text = "";
                Saver.Instance.LoadScore((score) =>
                {
                    UpdateBalance();
                });
                AccountNetwork.Instance.UpdateUserData();
            },
            (error) =>
            {
                SetLoading(false);
                m_errorText.Spawn(m_errorTextSpawnPoint.position, "Error...");
            });
    }

    private void OnInputValueChanged(string valueStr)
    {
        double value = string.IsNullOrEmpty(valueStr) ? 0 : double.Parse(valueStr);
        m_exchangeGold.text = $"Gold: {System.Math.Round(value / _exchangeGemsPerGold, 4)}";
    }

    private void SetLoading(bool loading)
    {
        m_exchangeButton.SetActive(!loading);
        m_loadingPanel.SetActive(loading);
    }

    private void UpdateBalance()
    {
        m_balanceText.text = m_game.GetGemsBalance().ToString("F0") + Icons.Gem;
        m_goldBalanceText.text = $"Gold: {(m_game.GetGemsBalance() / _exchangeGemsPerGold).ToString("F3")}";
    }

}
