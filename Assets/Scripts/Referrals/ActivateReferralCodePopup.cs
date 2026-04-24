using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ActivateReferralCodePopup : MonoBehaviour
{

    [SerializeField] private TMP_InputField m_codeInputField;
    [SerializeField] private Button m_closeButton;

    private void OnEnable()
    {
        m_codeInputField.text = "";
    }

    public void Paste()
    {
        m_codeInputField.text = GUIUtility.systemCopyBuffer;
    }

    public void Activate()
    {
        if (string.IsNullOrEmpty(m_codeInputField.text) || TelegramApp.Instance.user == null)
            return;

        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        form.AddField("code", m_codeInputField.text);
        DatabaseNetwork.Instance.Send(form, "referral-become.php",
            (data) =>
            {
                m_closeButton.onClick.Invoke();
            },
            (error) =>
            {
                m_closeButton.onClick.Invoke();
            });
    }

}
