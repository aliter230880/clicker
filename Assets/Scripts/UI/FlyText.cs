using System.Collections;
using TMPro;
using UnityEngine;

[RequireComponent(typeof(TMP_Text))]
public class FlyText : MonoBehaviour
{

    [SerializeField] private float m_startDelay;
    [SerializeField] private float m_duration;
    [SerializeField] private float m_flyHeight;
    [SerializeField] private CanvasGroup m_canvasGroup;

    private TMP_Text _textMesh;

    public void Spawn(Vector2 position, string text)
    {
        if (_textMesh == null)
            _textMesh = GetComponent<TMP_Text>();

        _textMesh.text = text;
        transform.position = (Vector2)position;
        m_canvasGroup.alpha = 1f;
        gameObject.SetActive(true);
        StartCoroutine(FlyAnim());
    }

    private void OnDisable()
    {
        gameObject.SetActive(false);
    }

    private IEnumerator FlyAnim()
    {
        yield return new WaitForSeconds(m_startDelay);
        for (float t = 0; t < m_duration; t += Time.deltaTime)
        {
            float progress = 1f / m_duration * t;
            transform.localPosition += Vector3.up * m_flyHeight * Time.deltaTime;
            m_canvasGroup.alpha = 1f - progress;
            yield return null;
        }
        gameObject.SetActive(false);
    }

}
