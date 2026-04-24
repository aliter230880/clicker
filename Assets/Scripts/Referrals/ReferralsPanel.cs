using System;
using UnityEngine;

public class ReferralsPanel : MonoBehaviour
{

    [SerializeField] private ReferralCodePanel m_codePanel;

    private void Awake()
    {
        Saver.OnLoad += Init;
    }

    private void Init()
    {
        Saver.OnLoad -= Init;
        if (Saver.Instance.IsUserFirstVisit)
        {
            WWWForm form = new WWWForm();
            form.AddField("telegram", TelegramApp.Instance.user.id);
            form.AddField("referral", TelegramApp.Instance.user.urlParams != null && TelegramApp.Instance.user.urlParams.ContainsKey("ref") ? 
                TelegramApp.Instance.user.urlParams["ref"] : "");
            DatabaseNetwork.Instance.Send(form, "register-user.php",
                (data) =>
                {

                },
                (error) =>
                {

                });
        }
    }

    public void GetReferralsCount(Action<int> callback)
    {
        if (string.IsNullOrEmpty(m_codePanel.Code))
        {
            m_codePanel.GetCode((code) => GetReferralsCount(callback));
            return;
        }    

        WWWForm form = new WWWForm();
        form.AddField("code", m_codePanel.Code);
        DatabaseNetwork.Instance.Send(form, "referral-get-count.php",
            (data) =>
            {
                callback?.Invoke(int.Parse(data));
            },
            (error) =>
            {

            });
    }

}
