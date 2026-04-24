using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;

public class SwitchUI : MonoBehaviour, IPointerClickHandler
{

    [SerializeField] private bool m_isOn;
    [Space]
    [SerializeField] private RectTransform m_swtichBackground;
    [SerializeField] private RectTransform m_handle;
    [SerializeField] private float m_animationDuration = 0.5f;
    [Space]
    [SerializeField] private UnityEvent<float> m_onChangeValueProgress;
    [Space]
    public UnityEvent<bool> OnValueChanged;

    public bool isOn
    {
        get => m_isOn;
        set
        {
            SetActive(value);
        }
    }

    private float _progress;

    private void Start()
    {
        UpdateUI();
    }

    private void Update()
    {
        float oldProgress = _progress;
        _progress = Mathf.MoveTowards(_progress, isOn ? 1f : 0f, 1f / m_animationDuration * Time.deltaTime);
        if (oldProgress != _progress)
        {
            UpdateUI();
        }
    }

    public void SetActive(bool active, bool callback = true, bool animation = true)
    {
        if (m_isOn == active)
            return;

        m_isOn = active;
        if (callback)
            OnValueChanged?.Invoke(m_isOn);
        if (animation == false)
        {
            _progress = active ? 1f : 0f;
            UpdateUI();
        }
    }

    private void UpdateUI()
    {
        Vector2 size = m_swtichBackground.rect.size - m_handle.rect.size;
        m_handle.anchoredPosition = new Vector2(0, size.y * _progress - size.y / 2f);
        m_onChangeValueProgress?.Invoke(_progress);
    }

    public void OnPointerClick(PointerEventData eventData)
    {
        isOn = !isOn;
    }

}
