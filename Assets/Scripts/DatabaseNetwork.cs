using System;
using System.Collections;
using UnityEngine;

public class DatabaseNetwork : MonoBehaviour
{

    [SerializeField] private string m_url;
    [SerializeField] private bool m_useTestUrl;
    [SerializeField] private string m_testUrl;
    [SerializeField] private string m_sqlPrefix;

    public static DatabaseNetwork Instance { get; private set; }

    public string Url => m_useTestUrl ? m_testUrl : m_url;

    private void Awake()
    {
        if (Instance == null)
            Instance = this;
        else
        {
            Destroy(gameObject);
            return;
        }
        DontDestroyOnLoad(gameObject);
    }

    public void Send(WWWForm form, string fileName, Action<string> onSuccess, Action<string> onFailed)
    {
        StartCoroutine(Sending(form, fileName, onSuccess, onFailed));
    }


    //private IEnumerator Sending(WWWForm form, string fileName, Action<string> onSuccess, Action<string> onFailed)
    //{
    //    Debug.Log($"Sending to {fileName}");
    //    UnityWebRequest request = UnityWebRequest.Post(Url + m_sqlPrefix + "/" + fileName, form);
    //    request.SetRequestHeader("Access-Control-Allow-Origin", "*");
    //    yield return request.SendWebRequest();

    //    if (string.IsNullOrEmpty(request.error))
    //    {
    //        Result result = null;
    //        try
    //        {
    //            result = JsonUtility.FromJson<Result>(request.downloadHandler.text);
    //        }
    //        catch (Exception ex)
    //        {
    //            Debug.LogError("Error: " + ex + "\n" + request.downloadHandler.text);
    //            yield break;
    //        }
    //        if (result == null)
    //        {
    //            Debug.LogError("Error: " + request.error);
    //            onFailed?.Invoke(request.downloadHandler.text);
    //        }
    //        else if (result.success == false)
    //        {
    //            Debug.LogError("Error: " + result.text);
    //            onFailed?.Invoke(result.text);
    //        }
    //        else
    //        {
    //            Debug.Log("Success\n" + result.text);
    //            onSuccess?.Invoke(result.text);
    //        }
    //    }
    //    else
    //    {
    //        Debug.LogError("Error: " + request.error);
    //        onFailed?.Invoke(request.error);
    //    }
    //}

    private IEnumerator Sending(WWWForm form, string fileName, Action<string> onSuccess, Action<string> onFailed)
    {
        //yield break;
        Debug.Log($"Sending to {fileName}");
        WWW www = new WWW(Url + m_sqlPrefix + "/" + fileName, form);
        yield return www;

        if (string.IsNullOrEmpty(www.error))
        {
            Result result = null;
            try
            {
                result = JsonUtility.FromJson<Result>(www.text);
            }
            catch (Exception ex)
            {
                Debug.LogError("Error: " + ex + "\n" + www.text);
                yield break;
            }
            if (result == null)
            {
                Debug.LogError("Error: " + www.error);
                onFailed?.Invoke(www.text);
            }
            else if (result.success == false)
            {
                Debug.LogError("Error: " + result.text);
                onFailed?.Invoke(result.text);
            }
            else
            {
                Debug.Log("Success\n" + result.text);
                onSuccess?.Invoke(result.text);
            }
        }
        else
        {
            Debug.LogError("Error: " + www.error);
            onFailed?.Invoke(www.error);
        }
    }

    [Serializable]
    private class Result
    {
        public bool success;
        public string text;
    }

}
