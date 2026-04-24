using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GroupsUpdater : MonoBehaviour
{

    private List<RectTransform> _groups;

    private void OnEnable()
    {
        if (_groups == null)
        {
            _groups = new List<RectTransform>();
            foreach (var item in transform.GetComponentsInChildren<LayoutGroup>(true))
            {
                _groups.Add(item.GetComponent<RectTransform>());
            }
        }
        StartCoroutine(Updater());
    }

    private IEnumerator Updater()
    {
        yield return null;
        foreach (var item in _groups)
            LayoutRebuilder.ForceRebuildLayoutImmediate(item);
        yield return null;
        foreach (var item in _groups)
            LayoutRebuilder.ForceRebuildLayoutImmediate(item);
    }

}
