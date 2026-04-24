using AccountSystem;
using System.Text;
using TMPro;
using UnityEngine;

public class ProfilePanel : MonoBehaviour
{

    [SerializeField] private TMP_Text m_usernameText;
    [Space]
    [SerializeField] private GameObject m_accountConnect;
    [SerializeField] private GameObject m_accountNoConnect;
    [SerializeField] private TMP_Text m_accountStatText;
    [Space]
    [SerializeField] private GameObject m_walletConnect;
    [SerializeField] private GameObject m_walletNoConnect;
    [SerializeField] private TMP_Text m_walletAddressText;
    [SerializeField] private TMP_Text m_walletBalanceText;
    [SerializeField] private GameObject m_walletDisconnectButton;

    private void OnEnable()
    {
        UpdateUI();

        ThirdwebNetwork.OnWalletConnected += UpdateWalletConnect;
        ThirdwebNetwork.OnWalletDisconnected += UpdateWalletConnect;
    }

    private void OnDisable()
    {
        ThirdwebNetwork.OnWalletConnected -= UpdateWalletConnect;
        ThirdwebNetwork.OnWalletDisconnected -= UpdateWalletConnect;
    }

    private void UpdateUI()
    {
        UpdateAccountConnect();
        UpdateWalletConnect();
        m_usernameText.text = TelegramApp.Instance.user.username;

        if (AccountNetwork.Instance.userData != null)
            m_accountStatText.text = $"Username:\n{AccountNetwork.Instance.userData.username}\n\nGold balance: {AccountNetwork.Instance.userData.gold}";
        if (TelegramApp.Instance.user.isTelegramApp)
        {
            if (string.IsNullOrEmpty(ThirdwebNetwork.Instance.LastConnectedWalletAddress) == false)
            {
                m_walletAddressText.text = FormatWalletAddress(ThirdwebNetwork.Instance.LastConnectedWalletAddress);
                m_walletBalanceText.text = "-";
            }
        }
        else
        {
            if (ThirdwebNetwork.Instance.Wallet != null)
            {
                m_walletAddressText.text = FormatWalletAddress(ThirdwebNetwork.Instance.Address);
                m_walletBalanceText.text = System.Math.Round(ThirdwebNetwork.Instance.Balance, 2) + " LUX";
            }
        }
        m_walletDisconnectButton.SetActive(TelegramApp.Instance.user.isTelegramApp == false);
    }

    private void UpdateAccountConnect()
    {
        m_accountConnect.SetActive(AccountNetwork.Instance.userData != null);
        m_accountNoConnect.SetActive(AccountNetwork.Instance.userData == null);
    }

    private void UpdateWalletConnect()
    {
        if (TelegramApp.Instance.user.isTelegramApp)
        {
            m_walletConnect.SetActive(!string.IsNullOrEmpty(ThirdwebNetwork.Instance.LastConnectedWalletAddress));
            m_walletNoConnect.SetActive(string.IsNullOrEmpty(ThirdwebNetwork.Instance.LastConnectedWalletAddress));
        }
        else
        {
            m_walletConnect.SetActive(ThirdwebNetwork.Instance.Wallet != null);
            m_walletNoConnect.SetActive(ThirdwebNetwork.Instance.Wallet == null);
        }
    }

    private string FormatWalletAddress(string address)
    {
        StringBuilder builder = new StringBuilder();
        builder.Append(address.Substring(0, 7));
        builder.Append("...");
        builder.Append(address.Substring(address.Length - 5, 5));
        return builder.ToString();
    }

}
