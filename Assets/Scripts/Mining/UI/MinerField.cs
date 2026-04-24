using System.Collections;
using System.Globalization;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class MinerField : MonoBehaviour
{

    [SerializeField] private RawImage m_nftImage;
    [SerializeField] private GameObject m_imageLoading;
    [SerializeField] private TMP_Text m_nftNameText;
    [SerializeField] private TMP_Text m_miningGemsText;
    [SerializeField] private SwitchUI m_activeSwitch;
    [Space]
    [SerializeField] private GameObject m_workPanel;
    [SerializeField] private GameObject m_stopedPanel;

    public MinersListData minersList { get; private set; }
    public int dataIndex { get; private set; }
    public MinerData data => minersList.miners[dataIndex];
    public MinerStatsData stats { get; private set; }
    public MinersList.NftImage nftImage { get; private set; }

    public void SetMiner(MinersListData minersList, int dataIndex, MinerStatsData stats, MinersList.NftImage nftImage)
    {
        this.minersList = minersList;
        this.dataIndex = dataIndex;
        this.stats = stats;
        this.nftImage = nftImage;
        UpdateUI();
    }

    public void UpdateUI()
    {
        if (m_workPanel)
            m_workPanel.SetActive(data.isActive);
        if (m_stopedPanel)
            m_stopedPanel.SetActive(!data.isActive);
        if (m_nftNameText)
            m_nftNameText.text = nftImage.nft.Metadata.Name;
        if (m_activeSwitch)
            m_activeSwitch.SetActive(data.isActive, false, false);
    }

    public void SetMinerActive(bool active)
    {
        if (TelegramApp.Instance.user.isTelegramApp)
        {
            if (m_activeSwitch)
                m_activeSwitch.SetActive(data.isActive, false, false);
            return;
        }

        WWWForm form = new WWWForm();
        form.AddField("walletAddress", ThirdwebNetwork.Instance.Address);
        form.AddField("minerId", minersList.tokenId);
        form.AddField("minerIndex", dataIndex);
        form.AddField("active", active ? "1" : "0");
        DatabaseNetwork.Instance.Send(form, "miners/set-miner-active.php",
            (data) =>
            {
                MinerData newMinerData = JsonUtility.FromJson<MinerData>(data);
                this.data.isActive = newMinerData.isActive;
                this.data.lastTimeReset = newMinerData.lastTimeReset;
                if (m_activeSwitch)
                    m_activeSwitch.SetActive(active, false, false);
            },
            (error) =>
            {
                if (m_activeSwitch)
                    m_activeSwitch.SetActive(data.isActive, false, false);
            });
    }

    private IEnumerator TimerUpdater()
    {
        if (stats == null)
            yield break;
        while (true)
        {
            m_miningGemsText.text = data.isActive ? MinerData.CalculateMiningGems(stats, data.lastTimeReset).ToString("N0", CultureInfo.InvariantCulture) + Icons.Gem
                                                   : "-";
            yield return new WaitForSeconds(1);
        }
    }

    private void OnEnable()
    {
        if (nftImage != null)
        {
            if (nftImage.isLoading)
            {
                m_imageLoading.SetActive(true);
                nftImage.onLoaded += LoadNftImage;
            }
            else
            {
                m_nftImage.texture = nftImage.texture;
                m_imageLoading.SetActive(false);
            }
        }
        UpdateUI();
        StartCoroutine(TimerUpdater());
    }

    private void OnDisable()
    {
        if (nftImage != null)
            nftImage.onLoaded -= LoadNftImage;
    }

    private void LoadNftImage(Texture texture)
    {
        m_nftImage.texture = texture;
        m_imageLoading.SetActive(false);
    }

}
