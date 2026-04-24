using System;
using UnityEngine;

namespace AccountSystem {

    public class AccountNetwork : MonoBehaviour
    {

        public static AccountNetwork Instance { get; private set; }

        public static Action OnInitialize;

        public UserData userData { get; private set; }

        private void Awake()
        {
            Instance = this;
            TelegramApp.onRecieveUser += OnTelegramInit;
        }

        public void UpdateUserData()
        {
            if (TelegramApp.Instance.user == null)
                return;

            WWWForm form = new WWWForm();
            form.AddField("telegram", TelegramApp.Instance.user.id);
            DatabaseNetwork.Instance.Send(form, "get-user.php",
                (data) =>
                {
                    userData = JsonUtility.FromJson<UserData>(data);
                    OnInitialize?.Invoke();
                },
                (error) =>
                {
                    OnInitialize?.Invoke();
                });
        }

        private void OnTelegramInit(TelegramApp.UserData user)
        {
            UpdateUserData();
        }

    }

}