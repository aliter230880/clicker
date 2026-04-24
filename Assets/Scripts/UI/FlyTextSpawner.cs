using UnityEngine;
using UnityEngine.EventSystems;

public class FlyTextSpawner : MonoBehaviour
{

    [SerializeField] private ObjectPool<FlyText> m_textsPool;
    [Space]
    [SerializeField] private ClickPanel m_clickPanel;

    private Camera _mainCamera;

    private void Start()
    {
        _mainCamera = Camera.main;
    }

    public void SpawnText(Vector2 position, string text)
    {
        FlyText flyText = m_textsPool.Get();
        flyText.Spawn(position, text);
        flyText.gameObject.SetActive(true);
    }

    private void OnClick(PointerEventData eventData)
    {
        SpawnText(_mainCamera.ScreenToWorldPoint(eventData.pointerCurrentRaycast.screenPosition), "+1");
    }

    private void OnEnable()
    {
        m_clickPanel.OnClick += OnClick;
    }

    private void OnDisable()
    {
        m_clickPanel.OnClick -= OnClick;
    }

}
