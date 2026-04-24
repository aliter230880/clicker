using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class MinerInfoPanel : MonoBehaviour
{

    [SerializeField] private RawImage m_rawImage;
    [SerializeField] private TMP_Text m_nameText;
    [SerializeField] private SwitchUI m_workSwitch;

    private MinerData _data;


    public void SetMiner(MinerData data, MinerStatsData stats, MinersList.NftImage nftImage)
    {

    }

    public void SetMinerActive(bool active)
    {

    }

}
