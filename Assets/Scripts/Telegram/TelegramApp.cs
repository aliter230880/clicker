using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;

public class TelegramApp : MonoBehaviour
{

    public static Action<UserData> onRecieveUser;

    [DllImport("__Internal")]
    private static extern void GetUserInternal();
    [DllImport("__Internal")]
    private static extern void HapticInternal();
    [DllImport("__Internal")]
    private static extern void IsTelegramAppInternal();

    public UserData user { get; private set; }

    public static TelegramApp Instance { get; private set; }

    private void Awake()
    {
        Instance = this;
    }

    private void Start()
    {
        GetUser();
    }

    public void GetUser()
    {
#if UNITY_EDITOR
        OnRecieveMessage(JsonUtility.ToJson(new RecieveMessage()
        {
            type = "userData",
            message = JsonUtility.ToJson(new UserData()
            {
                id = "2025",
                username = "TestAccount",
                isTelegramApp = true
            })
        }));
#else
        GetUserInternal();
#endif
    }

    public void Haptic()
    {
#if !UNITY_EDITOR
        HapticInternal();
#endif
    }

    public void OnRecieveMessage(string message)
    {
        RecieveMessage data = JsonUtility.FromJson<RecieveMessage>(message);
        switch (data.type)
        {
            case "userData":
                //user = JsonUtility.FromJson<UserData>(data.message);
                user = JsonConvert.DeserializeObject<UserData>(data.message);
                onRecieveUser?.Invoke(user);
                Debug.Log(data.message);
                break;
        }
    }

    [Serializable]
    public class UserData
    {
        public string id;
        public string username;
        public bool isTelegramApp;
        public Dictionary<string, string> urlParams;
    }

    [Serializable]
    private class RecieveMessage
    {
        public string type;
        public string message;
    }

}
