using System;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;

public class ClickPanel : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
{

    [SerializeField] private Game m_game;

    public Action<PointerEventData> OnClick;

    private ClickerProtect _clickerProtect;

    private void Start()
    {
        _clickerProtect = new ClickerProtect();
    }

    public void OnPointerDown(PointerEventData eventData)
    {
        _clickerProtect.Down(eventData.position);
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        bool protectResult = _clickerProtect.Up(eventData.position);
        if (protectResult == false)
            return;

        m_game.AddScore(1);
        TelegramApp.Instance.Haptic();
        OnClick?.Invoke(eventData);
    }

}
