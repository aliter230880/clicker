using System.Globalization;
using System.Numerics;
using Thirdweb;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class MinerPurchaseField : MonoBehaviour
{

    [SerializeField] private RawImage m_nftImage;
    [SerializeField] private TMP_Text m_nameText;
    [SerializeField] private TMP_Text m_statsText;
    [SerializeField] private TMP_Text m_ownerText;
    [SerializeField] private TMP_Text m_priceText;
    [SerializeField] private GameObject m_imageLoading;

    public NFT nft { get; private set; }
    public Listing listing { get; private set; }
    public MinerStatsData data { get; private set; }
    public BigInteger balance { get; private set; }

    private MinersList.NftImage _nftImage;

    private bool _isInit;

    public void SetMiner(NFT nft, MinerStatsData minerData, MinersList.NftImage nftImage)
    {
        this.nft = nft;
        listing = null;
        data = minerData;
        _isInit = false;
        _nftImage = nftImage;
        InitNft();
        UpdateUI();
    }

    public void UpdateUI()
    {
        m_nameText.text = nft.Metadata.Name;
        m_statsText.text = $"Mining:\n{data.gemsPerDay.ToString("N0", CultureInfo.InvariantCulture)}{Icons.Gem} / day";
        m_ownerText.text = _isInit ? $"You have: {balance}" : "Loading...";
        m_priceText.text = _isInit ? $"{ThirdwebNetwork.Instance.WeiToValue(listing.PricePerToken, 18)} LUX" : "Loading...";
    }

    public void Buy()
    {
        ThirdwebUI.Instance.OpenNFT(nft, listing);
    }

    public async void InitNft()
    {
        try
        {
            listing = await NFTMarketplace.Instance.GetNftMainListing(BigInteger.Parse(nft.Metadata.Id));
        }
        catch (System.Exception ex)
        { }
        try
        {
            balance = await NFTMarketplace.Instance.BalanceOf(BigInteger.Parse(nft.Metadata.Id));
        }
        catch (System.Exception ex)
        { }
        _isInit = true;
        UpdateUI();
    }

    private void OnEnable()
    {
        if (_nftImage != null)
        {
            if (_nftImage.isLoading)
            {
                m_imageLoading.SetActive(true);
                _nftImage.onLoaded += LoadNftImage;
            }
            else
            {
                m_nftImage.texture = _nftImage.texture;
                m_imageLoading.SetActive(false);
            }
        }
    }

    private void OnDisable()
    {
        if (_nftImage != null)
            _nftImage.onLoaded -= LoadNftImage;
    }

    private void LoadNftImage(Texture texture)
    {
        m_nftImage.texture = texture;
        m_imageLoading.SetActive(false);
    }

}
