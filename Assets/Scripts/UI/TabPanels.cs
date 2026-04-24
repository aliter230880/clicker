using System.Collections.Generic;
using UnityEngine;

public class TabPanels : MonoBehaviour
{

    [SerializeField] private int m_startPanel = -1;
    [SerializeField] private List<GameObject> m_panels;

    private void Start()
    {
        if (m_startPanel >= 0 && m_startPanel < m_panels.Count)
            OpenPanel(m_panels[m_startPanel]);
        else
            CloseAllPanels();
    }

    public void OpenPanel(GameObject panel)
    {
        CloseAllPanels();
        panel.SetActive(true);
    }

    public void CloseAllPanels()
    {
        foreach (var panel in m_panels)
            panel.SetActive(false);
    }

}
