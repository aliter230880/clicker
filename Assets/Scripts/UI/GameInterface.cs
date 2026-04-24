using System.Globalization;
using TMPro;
using UnityEngine;

public class GameInterface : MonoBehaviour
{

    [SerializeField] private TMP_Text m_scoreText;
    [Space]
    [SerializeField] private Game m_game;

    private void OnEnable()
    {
        m_game.OnScoreChanged += ScoreChanged;
    }

    private void OnDisable()
    {
        m_game.OnScoreChanged -= ScoreChanged;
    }

    private void ScoreChanged(double score)
    {
        m_scoreText.text = m_game.GetGemsBalance().ToString("N0", CultureInfo.InvariantCulture) + Icons.Gem;
    }

}
