using System.Collections.Generic;
using Thirdweb;
using TMPro;
using UnityEngine;

public class ThirdwebUI : MonoBehaviour
{

    public static ThirdwebUI Instance { get; private set; }

    [SerializeField] private GameObject m_connectModalPanel;
    [SerializeField] private NFTField m_nftField;
    [SerializeField] private GameObject m_errorPanel;
    [SerializeField] private TMP_Text m_errorText;

    private void Awake()
    {
        Instance = this;
    }

    public void SetConnectModalActive(bool active) => m_connectModalPanel.SetActive(active);

    public void OpenNFT(NFT nft, Listing listing = null, List<UniGif.GifTexture> gifTextureList = null)
    {
        m_nftField.gameObject.SetActive(true);
        m_nftField.SetNFT(nft, listing, gifTextureList);
    }

    public void ShowError(System.Exception error)
    {
        ShowError(error.Message);
    }

    public void ShowError(string error)
    {
        m_errorText.text = error;
        m_errorPanel.SetActive(true);
    }

}
