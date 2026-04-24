using Newtonsoft.Json;
using System;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;
using Thirdweb;
using Thirdweb.Unity;
using UnityEngine;
using WalletConnectUnity.Core;

public class ThirdwebNetwork : MonoBehaviour
{

    //2f46f446e2b06ddad0a6875b18062e24
    //b2540153f25eedd8ae184458ab6c62db - my

    public const string CONTRACT_ADDRESS = "0x7324c346b47250A3e147a3c43B7A1545D0dC0796";
    public const int CHAIN_ID = 137;

    public static ThirdwebNetwork Instance { get; private set; }

    [SerializeField] private string m_addressTo;
    [SerializeField] private bool m_log;
    [SerializeField] private bool m_developer;

    public static Action OnWalletConnected;
    public static Action OnWalletDisconnected;

    public string MainWalletAddress => m_addressTo;

    public IThirdwebWallet Wallet { get; private set; }
    public ThirdwebContract Contract { get; private set; }
    public string Address { get; private set; }
    public string LastConnectedWalletAddress { get; private set; }

    public double Balance { get; private set; }
    public bool IsBalanceLoading { get; private set; }

    public Action OnBalanceLoading;
    public Action<double> OnBalanceChanged;

    private WalletOptions _walletOptions;

    private void Awake()
    {
        if (Instance == null)
            Instance = this;
        else
        {
            Destroy(gameObject);
            return;
        }
        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        if (TelegramApp.Instance.user == null)
            TelegramApp.onRecieveUser += AutoConnect;
        else
            AutoConnect(TelegramApp.Instance.user);
    }

    private void AutoConnect(TelegramApp.UserData user)
    {
        WWWForm form = new WWWForm();
        form.AddField("telegram", user.id);
        DatabaseNetwork.Instance.Send(form, "get-last-wallet-session.php",
            (data) =>
            {
                if (string.IsNullOrEmpty(data) == false)
                {
                    LastWalletSession lastWalletSession = JsonConvert.DeserializeObject<LastWalletSession>(data);
                    if (lastWalletSession != null)
                    {
                        LastConnectedWalletAddress = lastWalletSession.walletAddress;
                        if (TelegramApp.Instance.user.isTelegramApp == false)
                            ConnectWallet(lastWalletSession.options);
                    }
                }
            },
            (error) =>
            {

            });
        TelegramApp.onRecieveUser -= AutoConnect;
    }

    public void Connect()
    {
        ThirdwebUI.Instance.SetConnectModalActive(true);
    }

    public async void ConnectInAppWallet(AuthProvider authProvider = AuthProvider.Default, string email = null, string phoneNumber = null)
    {
        _walletOptions = await GetInAppWalletProvider(authProvider, email, phoneNumber);
        ConnectWallet(_walletOptions);
    }

    public async void ConnectWithWallet(WalletProvider walletProvider)
    {
        _walletOptions = await GetWalletProvider(walletProvider);
        ConnectWallet(_walletOptions);
    }

    private async Task<WalletOptions> GetWalletProvider(WalletProvider walletProvider)
    {
        return new WalletOptions(
            provider: walletProvider,
            chainId: CHAIN_ID);
    }

    private async Task<WalletOptions> GetInAppWalletProvider(AuthProvider authProvider = AuthProvider.Default, string email = null, string phoneNumber = null)
    {
        var inAppWalletOptions = new InAppWalletOptions(
                email: email,
                phoneNumber: phoneNumber,
                authprovider: authProvider
            );
        return new WalletOptions(
            provider: WalletProvider.InAppWallet,
            chainId: CHAIN_ID,
            inAppWalletOptions: inAppWalletOptions);
    }

    private async void ConnectWallet(WalletOptions options)
    {
        Wallet = await ThirdwebManager.Instance.ConnectWallet(options);
        Address = await Wallet.GetAddress();
        Log("Wallet Connected: " + Address);
        await CreateSmartContract();
        ThirdwebUI.Instance.SetConnectModalActive(false);
        OnWalletConnected?.Invoke();
        await Wallet.SwitchNetwork(CHAIN_ID);
        await GetBalance();
        Debug.Log(JsonConvert.SerializeObject(WalletConnect.Instance.ActiveSession));

        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("walletSession", JsonConvert.SerializeObject(new LastWalletSession()
        {
            walletAddress = Address,
            options = options
        }));
        DatabaseNetwork.Instance.Send(form, "set-wallet-session.php",
            (data) =>
            {

            },
            (error) =>
            {

            });
    }

    public async void Disconnect()
    {
        if (Wallet == null)
            return;
        await Wallet.Disconnect();
        Wallet = null;
        Address = "";
        OnWalletDisconnected?.Invoke();


        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("walletSession", "");
        DatabaseNetwork.Instance.Send(form, "set-wallet-session.php",
            (data) =>
            {

            },
            (error) =>
            {

            });
    }

    public async Task CreateSmartContract()
    {
        Contract = await ThirdwebContract.Create(Wallet.Client, CONTRACT_ADDRESS, CHAIN_ID);
        Debug.Log("Contract Created");
    }

    public async Task<BigInteger> GetBalance()
    {
        IsBalanceLoading = true;
        OnBalanceLoading?.Invoke();
        BigInteger balance = await Contract.ERC20_BalanceOf(Address);
        //BigInteger balance = await Contract.GetBalance();
        int decimals = await Contract.ERC20_Decimals();
        Balance = WeiToValue(balance, decimals);
        Log($"Balance: {Balance}");
        IsBalanceLoading = false;
        OnBalanceChanged?.Invoke(Balance);
        return balance;
    }

    public async void SendTransaction(double value, Action onSended, Action onSuccess, Action<string> onError)
    {
        try
        {
            int decimals = await Contract.ERC20_Decimals();
            BigInteger amount = BigInteger.Parse(ValueToWei(value, decimals));
            onSended?.Invoke();
            await Contract.ERC20_Transfer(Wallet, m_addressTo, amount);
            onSuccess?.Invoke();
            await GetBalance();
        }
        catch (Exception ex)
        {
            onError?.Invoke(ex.Message);
        }
    }

    public async void CoinAllowance(string address, Action<double> callback)
    {
        BigInteger allowance = await Contract.ERC20_Allowance(address, CONTRACT_ADDRESS);
        int decimals = await Contract.ERC20_Decimals();
        callback(WeiToValue(allowance, decimals));
    }

    public async void SendTransactionFrom(double value, Action onSended, Action onSuccess, Action<string> onError)
    {
        try
        {
            int decimals = await Contract.ERC20_Decimals();
            BigInteger amount = BigInteger.Parse(ValueToWei(value, decimals));

            onSended.Invoke();
            await Contract.ERC20_TransferFrom(Wallet, m_addressTo, Address, amount);
            onSuccess?.Invoke();
        }
        catch (Exception e)
        {
            onError?.Invoke(e.Message);
        }
    }

    private void Log(object message)
    {
        if (m_log)
            Debug.Log(message);
    }

    public string ValueToWei(double value, int decimals)
    {
        string str = value.ToString();
        string[] split = str.Split(',');

        StringBuilder result = new StringBuilder();
        result.Append(split[0]);

        if (split.Length > 1)
        {
            result.Append(split[1].Substring(0, Mathf.Clamp(decimals, 0, split[1].Length)));
            result.Append('0', decimals - split[1].Length);
        }
        else
            result.Append('0', decimals);

        return result.ToString();
    }

    public double WeiToValue(BigInteger value, int decimals)
    {
        string str = value.ToString();

        StringBuilder builder = new StringBuilder();
        if (str.Length < decimals + 1)
        {
            builder.Append("0,");
            builder.Append('0', decimals - str.Length);
            builder.Append(str);
        }
        else
        {
            builder.Append(str.Substring(0, str.Length - decimals));
            builder.Append(",");
            builder.Append(str.Substring(str.Length - decimals, decimals));
        }

        return Convert.ToDouble(builder.ToString());
    }

    [Serializable]
    private class LastWalletSession
    {
        public string walletAddress;
        public WalletOptions options;
    }

}
