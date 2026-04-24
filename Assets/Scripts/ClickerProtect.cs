using System;
using System.Collections.Generic;
using UnityEngine;

public class ClickerProtect
{

    private Queue<ClickData> _clicks = new Queue<ClickData>();
    private Pattern[] _patterns;
    private DateTime _lastClickTime;
    private DateTime _lastDown;

    private Queue<bool> _trueClicks = new Queue<bool>();

    private bool _firstClick = true;

    public ClickerProtect()
    {
        _patterns = new Pattern[]
        {
            new Pattern(4),
            new Pattern(5),
            new Pattern(5),
            new Pattern(6),
        };
    }

    public void ClearBotClicks()
    {
        _trueClicks.Clear();
    }

    public void Down(Vector2 position)
    {
        _lastDown = DateTime.Now;
    }

    public bool Up(Vector2 position)
    {
        bool clickResult = true;
        if (_firstClick)
            _firstClick = false;
        else
        {
            TimeSpan tsClick = DateTime.Now - _lastClickTime;
            TimeSpan tsUpDown = DateTime.Now - _lastDown;
            ClickData click = new ClickData() { delay = (float)tsClick.TotalMilliseconds, upDownDelay = (float)tsUpDown.TotalMilliseconds, position = position };
            _clicks.Enqueue(click);
            //Debug.Log(click.position + " : " + click.delay);

            bool isBot = false;

            if (click.delay <= 100f)
                isBot = true;

            //Debug.Log(_clicks.Peek().delay + " : " + averageDelay);
            if (_clicks.Count > 20)
            {
                float totalDelay = 0;
                float lastDelay = -1;
                foreach (var item in _clicks)
                {
                    if (lastDelay != -1)
                    {
                        totalDelay += Mathf.Abs(lastDelay - item.delay);
                    }
                    lastDelay = item.delay;
                }
                float averageDelay = totalDelay / (_clicks.Count - 1);
                if (averageDelay < 7f)
                {
                    isBot = true;
                }
                _clicks.Dequeue();
            }

            float patternsActivate = 0;
            foreach (var item in _patterns)
            {
                patternsActivate += item.AddClick(click);
            }
            if (patternsActivate < 3.2f)
                isBot = true;

            if (_trueClicks.Count > 20)
            {
                int botClicks = 0;
                foreach (var item in _trueClicks)
                {
                    if (item)
                        botClicks++;
                }
                if (1f / _trueClicks.Count * botClicks > 0.6f)
                {
                    clickResult = false;
                }
                _trueClicks.Dequeue();
            }

            _trueClicks.Enqueue(isBot);
        }
        _lastClickTime = DateTime.Now;
        return clickResult;
    }

    private struct ClickData
    {
        public Vector2 position;
        public float delay;
        public float upDownDelay;
    }

    private class Pattern
    {
        private List<ClickData> _clicks = new List<ClickData>();
        private Queue<ClickData> _lastClicks = new Queue<ClickData>();
        private int _maxCount;

        private int _totalClicks = 0;

        private float _lastResult;

        public Pattern(int maxCount)
        {
            _maxCount = maxCount;
            _totalClicks = UnityEngine.Random.Range(2, 10);
        }

        public float AddClick(ClickData clickData)
        {
            float result = 100f;
            if (_clicks.Count >= _maxCount)
            {
                if (_lastClicks.Count >= _maxCount)
                {
                    ClickData firstClick = _lastClicks.Peek();
                    if (Compare(firstClick, _clicks[0]) < 10f)
                    {
                        ClickData[] queueArray = _lastClicks.ToArray();
                        float identical = 0;
                        for (int i = 0; i < _clicks.Count; i++)
                        {
                            float curIdentical = 0;
                            for (int j = 0; j < queueArray.Length; j++)
                            {
                                int clickIndex = j + i;
                                if (clickIndex >= _clicks.Count)
                                    clickIndex -= _clicks.Count;
                                curIdentical += Compare(_clicks[clickIndex], queueArray[j]);
                            }
                            if (i == 0 || curIdentical < identical)
                            {
                                identical = curIdentical;
                            }
                        }
                        result = identical;
                    }

                    _lastClicks.Dequeue();
                }
                _lastClicks.Enqueue(clickData);
                _lastResult = result;
            }
            else
            {
                _clicks.Add(clickData);
                result = _lastResult;
            }
            _totalClicks--;
            if (_totalClicks <= 0)
            {
                _clicks.Clear();
                _totalClicks = _maxCount + UnityEngine.Random.Range(20, 100);
            }
            return result;
        }

        private float Compare(ClickData click1, ClickData click2)
        {
            //float dist = Vector2.Distance(click1.position, click2.position);
            float clickDelay = Mathf.Abs(click1.delay - click2.delay);
            float upDownDelay = Mathf.Abs(click1.upDownDelay - click2.upDownDelay);
            return /*0.03f * dist +*/ 0.028f * clickDelay + 0.028f * upDownDelay;
        }
    }

}
