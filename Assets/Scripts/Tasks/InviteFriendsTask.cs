using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class InviteFriendsTask : MonoBehaviour
{

    [SerializeField] private List<Image> m_stagesFields;
    [SerializeField] private Color m_activateColor;
    [SerializeField] private Color m_deactivateColor;
    [Space]
    [SerializeField] private ReferralsPanel m_referralsPanel;

    private void OnEnable()
    {
        m_referralsPanel.GetReferralsCount((referralsCount) =>
        {
            m_stagesFields[0].color = referralsCount >= 1 ? m_activateColor : m_deactivateColor;
            m_stagesFields[1].color = referralsCount >= 3 ? m_activateColor : m_deactivateColor;
            m_stagesFields[2].color = referralsCount >= 5 ? m_activateColor : m_deactivateColor;
        });
    }

}
