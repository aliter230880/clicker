using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class ObjectPool<T> : IDisposable where T : Component
{

    [SerializeField] private T prefab;
    [SerializeField] private Transform parent;
    [SerializeField] private int startCount;
    [SerializeField] private bool destroyExtraObjects = true;

    public T Prefab { get => prefab; }
    public Transform Parent { get => parent; }

    private Coroutine _deleter;

    private List<T> objects = new List<T>();

    public ObjectPool() { }

    public ObjectPool(T prefab, Transform parent, int startCount, bool destroyExtraObjects = true)
    {
        this.prefab = prefab;
        this.parent = parent;
        this.startCount = startCount;
        this.destroyExtraObjects = destroyExtraObjects;

        SpawnObjects(startCount);
    }

    public T Get()
    {
        if (objects.Count == 0)
        {
            SpawnObjects(startCount);
            _deleter = UnityEngine.Object.FindFirstObjectByType<MonoBehaviour>().StartCoroutine(Deleter());
        }

        T findedObj = objects.Find(e => e.gameObject.activeSelf == false);
        if (findedObj == null)
        {
            SpawnObjects(3);
            findedObj = objects.Find(e => e.gameObject.activeSelf == false);
        }
        return findedObj;
    }

    public List<T> GetObjects() => new List<T>(objects);
    public List<T> GetActiveObjects() => objects.FindAll(e => e.gameObject.activeSelf == true);
    public List<T> GetDisactiveObjects() => objects.FindAll(e => e.gameObject.activeSelf == false);

    public void HideEverything()
    {
        foreach (var item in objects)
            item.gameObject.SetActive(false);
    }

    public void Dispose()
    {
        foreach (var item in GetDisactiveObjects())
            UnityEngine.Object.Destroy(item.gameObject);
        if (_deleter != null)
            UnityEngine.Object.FindFirstObjectByType<MonoBehaviour>().StopCoroutine(_deleter);
        objects = null;
    }

    private void SpawnObjects(int count)
    {
        for (int i = 0; i < count; i++)
        {
            T obj = UnityEngine.Object.Instantiate(prefab, parent);
            obj.gameObject.SetActive(false);
            objects.Add(obj);
        }
    }

    private IEnumerator Deleter()
    {
        int maxUses = 0;
        float timer = 0;
        while (true)
        {
            yield return new WaitForSecondsRealtime(0.2f);
            if (destroyExtraObjects == false)
                continue;

            if (objects.Count <= startCount)
                continue;

            timer += Time.deltaTime;
            int uses = objects.FindAll(e => e.gameObject.activeSelf).Count;
            if (maxUses < uses)
            {
                maxUses = uses;
                timer = 0;
            }

            if (timer >= 30f)
            {
                maxUses = uses;
                int deleteCount = objects.Count - maxUses;
                for (int i = 0; i < deleteCount; i++)
                    objects.Remove(objects.Find(e => e.gameObject.activeSelf == false));
            }
        }
    }

}