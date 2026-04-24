using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Thirdweb;
using Thirdweb.Unity;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class NFTField : MonoBehaviour
{

    [SerializeField] private RawImage m_image;
    [SerializeField] private UniGifImage m_gifImage;
    [SerializeField] private GameObject m_loadingImagePanel;
    [SerializeField] private TMP_Text m_nameText;
    [SerializeField] private TMP_Text m_descriptionText;
    [SerializeField] private GameObject m_listingPanel;
    [SerializeField] private TMP_Text m_priceText;
    [Space]
    [SerializeField] private GameObject m_listingBuyPanel;
    [SerializeField] private GameObject m_listingPurchasePanel;
    [SerializeField] private GameObject m_listingSuccessPanel;
    [SerializeField] private GameObject m_approveLoading;
    [SerializeField] private GameObject m_approveCheck;
    [SerializeField] private GameObject m_purchaseLoading;
    [SerializeField] private GameObject m_purchaseCheck;

    public NFT CurrentNFT { get; private set; }
    public Listing CurrentListing { get; private set; }

    private RectTransform _buyButtonRect;

    private void OnEnable()
    {
        m_listingBuyPanel.SetActive(true);
        m_listingPurchasePanel.SetActive(false);
        m_listingSuccessPanel.SetActive(false);
    }

    public void SetNFT(NFT nft, Listing listing = null, List<UniGif.GifTexture> gifTextureList = null)
    {
        CurrentNFT = nft;
        CurrentListing = listing;
        UpdateUI();
        if (gifTextureList == null)
            StartCoroutine(LoadImage(CurrentNFT.Metadata.Image));
        else
        {
            m_gifImage.SetGif(gifTextureList);
            m_loadingImagePanel.SetActive(false);
        }
    }

    public void OpenInMarketplace()
    {
        Application.OpenURL($"https://nft.aliterra.space/listing/{CurrentNFT.Metadata.Id}");
    }

    public void BuyListing()
    {
        if (CurrentListing == null)
            return;
        NFTMarketplace.PurchaseStatus lastStatus = NFTMarketplace.PurchaseStatus.Loading;
        NFTMarketplace.Instance.BuyListing(CurrentListing, 
            onSuccess: () =>
            {
                m_listingPurchasePanel.SetActive(false);
                m_listingSuccessPanel.SetActive(true);
            },
            onError: (error) =>
            {
                m_listingPurchasePanel.SetActive(false);
                m_listingBuyPanel.SetActive(true);
                ThirdwebUI.Instance.ShowError(error + "\nPlease try again or you can buy this nft on our web marketplace.");
            },
            onStatusChanged: (status) =>
            {
                switch (status)
                {
                    case NFTMarketplace.PurchaseStatus.Loading:
                        m_listingBuyPanel.SetActive(false);
                        m_listingPurchasePanel.SetActive(true);
                        m_approveLoading.SetActive(false);
                        m_approveCheck.SetActive(false);
                        m_purchaseLoading.SetActive(false);
                        m_purchaseCheck.SetActive(false);
                        break;
                    case NFTMarketplace.PurchaseStatus.Approve:
                        m_approveLoading.SetActive(true);
                        m_approveCheck.SetActive(false);
                        m_purchaseLoading.SetActive(false);
                        m_purchaseCheck.SetActive(false);
                        break;
                    case NFTMarketplace.PurchaseStatus.Purchasing:
                        m_approveLoading.SetActive(false);
                        m_approveCheck.SetActive(true);
                        m_purchaseLoading.SetActive(true);
                        m_purchaseCheck.SetActive(false);
                        break;
                    case NFTMarketplace.PurchaseStatus.Success:
                        m_approveLoading.SetActive(false);
                        m_approveCheck.SetActive(true);
                        m_purchaseLoading.SetActive(false);
                        m_purchaseCheck.SetActive(true);
                        break;
                    case NFTMarketplace.PurchaseStatus.Error:
                        m_approveLoading.SetActive(false);
                        m_approveCheck.SetActive(false);
                        m_purchaseLoading.SetActive(false);
                        m_purchaseCheck.SetActive(false);
                        break;
                    default:
                        break;
                }
            });
    }

    private void UpdateUI()
    {
        m_nameText.text = CurrentNFT.Metadata.Name;
        m_descriptionText.text = CurrentNFT.Metadata.Description;

        if (CurrentListing == null)
            m_listingPanel.SetActive(false);
        else
        {
            m_listingPanel.SetActive(true);
            m_priceText.text = $"{ThirdwebNetwork.Instance.WeiToValue(CurrentListing.PricePerToken, 18)} LUX";
        }
    }

    private IEnumerator LoadImage(string url)
    {
        m_loadingImagePanel.SetActive(true);

        if (url.Contains("ipfs"))
        {
            url = url.Replace("ipfs://", "https://ipfs.io/ipfs/");
            m_gifImage.SetGifFromUrl(url);

            while (m_gifImage.TexturesCount <= 0)
                yield return null;

            m_loadingImagePanel.SetActive(false);
        }
        else
        {
            Task<Sprite> task = CurrentNFT.GetNFTSprite(ThirdwebNetwork.Instance.Wallet.Client);
            yield return task;
            m_image.texture = task.Result.texture;
        }
        yield return null;
    }

}
