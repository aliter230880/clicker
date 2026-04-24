using UnityEngine;
using UnityEngine.EventSystems;

public class ClickAnimation : MonoBehaviour
{

    [SerializeField] private AnimationCurve m_animationCurve;
    [SerializeField] private float m_duration;
    [Space]
    [SerializeField] private ClickPanel m_clickPanel;

    private float _timer;

    private void Start()
    {
        _timer = m_duration;
    }

    private void Update()
    {
        _timer += Time.deltaTime;
        float progress = Mathf.Clamp01(1f / m_duration * _timer);
        transform.localScale = new Vector3(1, m_animationCurve.Evaluate(progress), 1);
    }

    private void OnEnable()
    {
        m_clickPanel.OnClick += OnClick;
    }

    private void OnDisable()
    {
        m_clickPanel.OnClick -= OnClick;
    }

    private void OnClick(PointerEventData pointerEvent)
    {
        _timer = 0;
    }

}
