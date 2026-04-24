using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ThirdwebModalPanel : MonoBehaviour
{

    [SerializeField] private List<GameObject> m_loginFields;
    [SerializeField] private GameObject m_connectWithWalletButton;
    [SerializeField] private GameObject m_webConnectSelectPanel;

    private void OnEnable()
    {
        m_connectWithWalletButton.SetActive(true);
        m_webConnectSelectPanel.SetActive(false);
    }

    public void OpenField(GameObject field)
    {
        CloseAllFields();
        SetFieldActive(field, true);
    }

    public void CloseAllFields()
    {
        foreach (var item in m_loginFields)
        {
            SetFieldActive(item, false);
        }
    }

    private void SetFieldActive(GameObject field, bool active)
    {
        Button button = field.GetComponentInChildren<Button>(true);
        TMP_InputField inputField = field.GetComponentInChildren<TMP_InputField>(true);
        button.gameObject.SetActive(!active);
        inputField.gameObject.SetActive(active);
    }

    public void ConnectByGoogle() => ThirdwebNetwork.Instance.ConnectInAppWallet(authProvider: Thirdweb.AuthProvider.Google);
    public void ConnectByTelegram() => ThirdwebNetwork.Instance.ConnectInAppWallet(authProvider: Thirdweb.AuthProvider.Telegram);
    public void ConnectByTwitter() => ThirdwebNetwork.Instance.ConnectInAppWallet(authProvider: Thirdweb.AuthProvider.X);
    public void ConnectByFacebook() => ThirdwebNetwork.Instance.ConnectInAppWallet(authProvider: Thirdweb.AuthProvider.Facebook);

    public void ConnectByEmail(TMP_InputField inputField) => ThirdwebNetwork.Instance.ConnectInAppWallet(email: inputField.text);
    public void ConnectByPhone(TMP_InputField inputField) => ThirdwebNetwork.Instance.ConnectInAppWallet(phoneNumber: inputField.text);

    public void ConnectWithWallet()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        m_connectWithWalletButton.SetActive(false);
        m_webConnectSelectPanel.SetActive(true);
#else
        ConnectWithQr();
#endif
    }

    public void ConnectWithQr()
    {
        ThirdwebNetwork.Instance.ConnectWithWallet(Thirdweb.Unity.WalletProvider.WalletConnectWallet);
        m_connectWithWalletButton.SetActive(true);
        m_webConnectSelectPanel.SetActive(false);
    }
    public void ConenctWithExtension()
    {
        ThirdwebNetwork.Instance.ConnectWithWallet(Thirdweb.Unity.WalletProvider.MetaMaskWallet);
        m_connectWithWalletButton.SetActive(true);
        m_webConnectSelectPanel.SetActive(false);
    }

}
