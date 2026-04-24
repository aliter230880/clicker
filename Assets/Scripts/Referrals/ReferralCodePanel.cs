using System;
using TMPro;
using UnityEngine;

public class ReferralCodePanel : MonoBehaviour
{

    [SerializeField] private TMP_Text m_codeText;
    [SerializeField] private TMP_InputField m_linkInputField;

    public string Code { get; private set; }

    public void CopyCode()
    {
        GUIUtility.systemCopyBuffer = Code;
    }

    public void CopyLink()
    {
        GUIUtility.systemCopyBuffer = GetLink();
    }

    public string GetLink() => DatabaseNetwork.Instance.Url + $"?ref={Code}";

    private void OnEnable()
    {
        if (string.IsNullOrEmpty(Code))
            GetCode(null);
        UpdateUI();
    }

    private void UpdateUI()
    {
        m_codeText.text = string.IsNullOrEmpty(Code) ? "Loading..." : Code;
        m_linkInputField.text = string.IsNullOrEmpty(Code) ? "" : GetLink();
    }

    public void GetCode(Action<string> callback)
    {
        if (TelegramApp.Instance.user == null)
            return;
        WWWForm form = new WWWForm();
        form.AddField("telegram", TelegramApp.Instance.user.id);
        DatabaseNetwork.Instance.Send(form, "get-user-referral-code.php",
            (data) =>
            {
                Code = data;
                UpdateUI();
                callback?.Invoke(data);
            },
            (error) =>
            {

            });
    }

}
