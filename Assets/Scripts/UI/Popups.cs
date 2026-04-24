using System.Collections.Generic;
using UnityEngine;

public class Popups : MonoBehaviour
{

    [SerializeField] private GameObject m_background;
    [SerializeField] private List<PopupPanel> m_popupsPanels;

    public void Open(string name)
    {
        int popupIndex = m_popupsPanels.FindIndex(e => e.name == name);
        if (popupIndex == -1)
            return;

        m_background.SetActive(true);
        m_popupsPanels[popupIndex].panel.SetActive(true);
        m_popupsPanels[popupIndex].panel.transform.SetAsLastSibling();
    }

    public void ClosePopup(GameObject popup)
    {
        if (m_popupsPanels.FindIndex(e => e.panel == popup) == -1)
            return;

        popup.SetActive(false);

        bool allClosed = true;
        foreach (var item in m_popupsPanels)
        {
            if (item.panel.activeSelf)
            {
                allClosed = false;
                break;
            }
        }
        if (allClosed)
            m_background.SetActive(false);
    }

    [System.Serializable]
    private struct PopupPanel
    {
        public string name;
        public GameObject panel;
    }

}
