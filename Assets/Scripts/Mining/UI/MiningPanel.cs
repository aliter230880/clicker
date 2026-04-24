using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using TMPro;
using UnityEngine;

public class MiningPanel : MonoBehaviour
{

    [SerializeField] private GameObject m_balancePanel;
    [SerializeField] private GameObject m_withdrawalsPanel;
    [SerializeField] private GameObject m_withdrawalsTgAppPanel;
    [SerializeField] private GameObject m_connectWalletPanel;
    [SerializeField] private GameObject m_connectWalletTgAppPanel;
    [Space]
    [SerializeField] private TMP_Text m_miningBalanceText;
    [SerializeField] private GameObject m_withdrawalButton;
    [SerializeField] private GameObject m_withdrawalLoading;
    [Space]
    [SerializeField] private MinersList m_minersList;

    public async void WithdrawalMiners()
    {
        if (ThirdwebNetwork.Instance.Wallet == null)
            return;

        SetWithdrawalLoading(true);

        List<MinersList.NftMinerData> nftMiners = await m_minersList.GetNftMiners();
        string nftMinersJson = JsonConvert.SerializeObject(nftMiners.ToArray());

        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("walletAddress", ThirdwebNetwork.Instance.Address);
        form.AddField("nftMiners", nftMinersJson);
        DatabaseNetwork.Instance.Send(form, "miners/withdrawal-miners.php",
            (data) =>
            {
                m_minersList.UpdateMiners();
                Saver.Instance.LoadScore();
                SetWithdrawalLoading(false);
            },
            (error) =>
            {
                SetWithdrawalLoading(false);
            });
    }

    private void OnEnable()
    {
        OnWalletStatusChanged();
        StartCoroutine(TimerUpdater());

        ThirdwebNetwork.OnWalletConnected += OnWalletStatusChanged;
        ThirdwebNetwork.OnWalletDisconnected += OnWalletStatusChanged;
    }

    private void OnDisable()
    {
        ThirdwebNetwork.OnWalletConnected -= OnWalletStatusChanged;
        ThirdwebNetwork.OnWalletDisconnected -= OnWalletStatusChanged;
    }

    private IEnumerator TimerUpdater()
    {
        while (true)
        {
            if (m_minersList.minersFields != null)
            {
                double balance = 0;
                foreach (var item in m_minersList.minersFields)
                {
                    if (item.data.isActive)
                        balance += MinerData.CalculateMiningGems(item.stats, item.data.lastTimeReset);
                }
                m_miningBalanceText.text = $"{balance.ToString("N0", CultureInfo.InvariantCulture)}{Icons.Gem}";
            }
            else
            {
                m_miningBalanceText.text = "-";
            }
            yield return new WaitForSeconds(1);
        }
    }

    private void OnWalletStatusChanged()
    {
        if (TelegramApp.Instance.user.isTelegramApp)
        {
            m_balancePanel.SetActive(string.IsNullOrEmpty(ThirdwebNetwork.Instance.LastConnectedWalletAddress) == false);

            m_withdrawalsTgAppPanel.SetActive(true);
            m_withdrawalsPanel.SetActive(false);

            m_connectWalletPanel.SetActive(false);
            m_connectWalletTgAppPanel.SetActive(string.IsNullOrEmpty(ThirdwebNetwork.Instance.LastConnectedWalletAddress));
        }
        else
        {
            m_balancePanel.SetActive(ThirdwebNetwork.Instance.Wallet != null);

            m_withdrawalsPanel.SetActive(true);
            m_withdrawalsTgAppPanel.SetActive(false);

            m_connectWalletPanel.SetActive(ThirdwebNetwork.Instance.Wallet == null);
            m_connectWalletTgAppPanel.SetActive(false);
        }
    }

    private void SetWithdrawalLoading(bool loading)
    {
        m_withdrawalButton.SetActive(!loading);
        m_withdrawalLoading.SetActive(loading);
    }

}
