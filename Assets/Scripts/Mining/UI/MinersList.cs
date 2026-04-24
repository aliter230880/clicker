using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Thirdweb;
using UnityEngine;

public class MinersList : MonoBehaviour
{

    [SerializeField] private ObjectPool<MinerPurchaseField> m_purchaseFieldsPool;
    [SerializeField] private ObjectPool<MinerField> m_minersFieldsPool;
    [Space]
    [SerializeField] private GameObject m_minersLists;
    [SerializeField] private MinerField m_minerInfoPanel;

    public MinerField[] minersFields { get; private set; }

    private List<NftImage> _nftImages = new List<NftImage>();
    private List<FieldData> fieldsDatas;

    private void Start()
    {
        Init();
        ThirdwebNetwork.OnWalletConnected += OnWalletConnected;
        ThirdwebNetwork.OnWalletDisconnected += OnWalletDisconnected;
    }

    public NftImage GetNftImage(NFT nft) => _nftImages.Find(e => e.nft.Metadata.Id == nft.Metadata.Id);

    public void OpenMinerInfo(MinerField minerFiled)
    {
        m_minerInfoPanel.SetMiner(minerFiled.minersList, minerFiled.dataIndex, minerFiled.stats, minerFiled.nftImage);
        m_minerInfoPanel.gameObject.SetActive(true);
        m_minersLists.SetActive(false);
    }

    public async Task<List<NftMinerData>> GetNftMiners()
    {
        if (ThirdwebNetwork.Instance.Wallet == null || Game.Config == null)
            return null;

        List<NftMinerData> result = new List<NftMinerData>();
        List<NFT> nfts = await NFTMarketplace.Instance.GetAllNFTs();
        foreach (var item in Game.Config.minersStats)
        {
            BigInteger balance = await NFTMarketplace.Instance.BalanceOf(BigInteger.Parse(item.tokenId));
            result.Add(new NftMinerData()
            {
                tokenId = item.tokenId,
                count = (int)balance
            });
        }

        return result;
    }

    private void Init()
    {
        if (NFTMarketplace.Instance.IsInitialize == false)
        {
            void OnInitialize()
            {
                Init();
                NFTMarketplace.OnInitialize -= OnInitialize;
            }
            NFTMarketplace.OnInitialize += OnInitialize;
            return;
        }

        void OnGameConfigInit()
        {
            InitFields(Game.Config.minersStats);
            StartCoroutine(CorrectTimeUpdater());

            Game.Config.OnInit -= OnGameConfigInit;
        }
        if (Game.Config.IsInit)
            OnGameConfigInit();
        else
            Game.Config.OnInit += OnGameConfigInit;
    }

    private async void InitFields(MinerStatsData[] minersStats)
    {
        fieldsDatas = new List<FieldData>();

        List<NFT> nfts = await NFTMarketplace.Instance.GetAllNFTs();
        foreach (var item in minersStats)
        {
            int nftIndex = nfts.FindIndex(e => e.Metadata.Id == item.tokenId);
            if (nftIndex != -1)
            {
                fieldsDatas.Add(new FieldData()
                {
                    nft = nfts[nftIndex],
                    minerStatsData = item
                });
                _nftImages.Add(new NftImage(this, nfts[nftIndex]));
            }
        }

        UpdatePurchaseFields(fieldsDatas);
        UpdateMiners();
    }

    private void OnWalletConnected()
    {
        foreach (var item in m_purchaseFieldsPool.GetActiveObjects())
        {
            item.InitNft();
        }
        UpdateMiners();
    }

    private void OnWalletDisconnected()
    {
        foreach (var item in m_purchaseFieldsPool.GetActiveObjects())
        {
            item.InitNft();
        }
        UpdateMiners();
    }

    private void UpdatePurchaseFields(List<FieldData> fields)
    {
        m_purchaseFieldsPool.HideEverything();

        foreach (var item in fields)
        {
            MinerPurchaseField field = m_purchaseFieldsPool.Get();
            field.SetMiner(item.nft, item.minerStatsData, GetNftImage(item.nft));
            field.gameObject.SetActive(true);
        }
    }

    public async void UpdateMiners()
    {
        if (fieldsDatas == null)
            return;

        string nftMinersJson = "-";

        if (TelegramApp.Instance.user.isTelegramApp == false)
        {
            List<NftMinerData> nftMiners = await GetNftMiners();
            nftMinersJson = JsonConvert.SerializeObject(nftMiners.ToArray());
        }

        WWWForm form = new WWWForm();
        form.AddField("walletAddress", TelegramApp.Instance.user.isTelegramApp ? ThirdwebNetwork.Instance.LastConnectedWalletAddress : ThirdwebNetwork.Instance.Address);
        form.AddField("nftMiners", nftMinersJson);
        DatabaseNetwork.Instance.Send(form, "miners/get-miners.php",
            (data) =>
            {
                MinersListData[] minersLists = JsonConvert.DeserializeObject<MinersListData[]>(data);
                UpdateMinersFields(fieldsDatas, new List<MinersListData>(minersLists));
            },
            (error) =>
            {

            });
    }

    private void UpdateMinersFields(List<FieldData> fields, List<MinersListData> minersLists)
    {
        m_minersFieldsPool.HideEverything();

        foreach (var minersList in minersLists)
        {
            for (int i = 0; i < minersList.miners.Length; i++)
            {
                int foundedFieldIndex = fields.FindIndex(e => e.nft.Metadata.Id == minersList.tokenId);
                if (foundedFieldIndex == -1)
                    continue;
                MinerField field = m_minersFieldsPool.Get();
                field.SetMiner(minersList, i, fields[foundedFieldIndex].minerStatsData, GetNftImage(fields[foundedFieldIndex].nft));
                field.gameObject.SetActive(true);
            }
        }

        minersFields = m_minersFieldsPool.GetActiveObjects().ToArray();
    }

    private IEnumerator CorrectTimeUpdater()
    {
        while (true)
        {
            MinerData.CorrectTime();
            yield return new WaitForSeconds(60f);
        }
    }

    private struct FieldData
    {
        public NFT nft;
        public MinerStatsData minerStatsData;
    }

    [Serializable]
    public class NftMinerData
    {
        public string tokenId;
        public int count;
    }

    public class NftImage
    {
        public bool isLoading { get; private set; }
        public Texture2D texture { get; private set; }
        public NFT nft { get; private set; }
        public Action<Texture2D> onLoaded;

        private MonoBehaviour _loadObject;

        public NftImage(MonoBehaviour loadObject, NFT nft)
        {
            this.nft = nft;
            texture = null;
            isLoading = true;
            _loadObject = loadObject;
            _loadObject.StartCoroutine(LoadImage());
        }

        private IEnumerator LoadImage()
        {
            using (WWW www = new WWW(nft.Metadata.Image.Replace("ipfs://", "https://ipfs.io/ipfs/")))
            {
                yield return www;

                if (string.IsNullOrEmpty(www.error) == false)
                {
                    Debug.LogError("File load error.\n" + www.error);
                    yield break;
                }

                yield return _loadObject.StartCoroutine(UniGif.GetTextureListCoroutine(www.bytes, (gifTexList, loopCount, width, height) =>
                {
                    if (gifTexList != null)
                    {

                    }
                    else
                    {
                        Debug.LogError("Gif texture get error.");
                    }
                },
                (gifTexture) =>
                {
                    texture = gifTexture.m_texture2d;
                    isLoading = false;
                    onLoaded?.Invoke(texture);
                },
                1, 10000));
            }
        }
    }

}
