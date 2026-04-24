using System.Collections.Generic;
using UnityEngine;

public class TabGroup : MonoBehaviour
{
    public List<TabButton> tabButtons;
    public StateStyle tabIdle;
    public StateStyle tabHover;
    public StateStyle tabActive;
    public StateStyle tabDeactive;

    public TabButton tab;

    private void Start()
    {
        if (tab != null)
            OnTabSelected(tab);
    }

    public void Subscribe(TabButton button)
    {
        if (tabButtons == null)
            tabButtons = new List<TabButton>();

        if (tabButtons.Contains(button) == false)
            tabButtons.Add(button);
    }

    public void OnTabEnter(TabButton button)
    {
        if (tab == null || button != tab)
            button.ChangeStyle(tabHover);
    }

    public void OnTabExit(TabButton button)
    {
        ResetTabs();
    }

    public void OnTabSelected(TabButton button)
    {
        tab?.Deselect();

        tab = button;
        tab.Select();
        ResetTabs();
        button.ChangeStyle(tabActive);
    }


    public void ResetTabs()
    {

        foreach (TabButton button in tabButtons)
        {
            if (tab == button)
                continue;
            button.ChangeStyle(tabIdle);
        }
    }

    public void DeselectTabs()
    {
        tab = null;
        foreach (TabButton button in tabButtons)
        {
            button.ChangeStyle(tabIdle);
            button.Deselect();
        }
    }

    [System.Serializable]
    public struct StateStyle
    {
        public Sprite sprite;
        public Color color;
    }

}
