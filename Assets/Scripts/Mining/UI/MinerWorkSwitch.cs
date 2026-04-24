using TMPro;
using UnityEngine;

public class MinerWorkSwitch : MonoBehaviour
{

    [SerializeField] private TMP_Text m_workText;
    [SerializeField] private TMP_Text m_stopedText;
    [SerializeField, Range(0f, 1f)] private float m_minAlpha = 0.5f;

    public void SetAnimationProgress(float progress)
    {
        m_workText.color = SetColorAlpha(m_workText.color, Mathf.Lerp(m_minAlpha, 1f, progress));
        m_stopedText.color = SetColorAlpha(m_stopedText.color, Mathf.Lerp(1f, m_minAlpha, progress));
    }

    private Color SetColorAlpha(Color color, float alpha)
    {
        return new Color(color.r, color.g, color.b, alpha);
    }

}
