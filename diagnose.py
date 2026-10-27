import json

with open('report-final.json', encoding='utf-8') as f:
    report = json.load(f)

audits = report.get('audits', {})

print("--- AUDITS WITH LOW SCORE (< 0.9) ---")
for k, v in audits.items():
    score = v.get('score')
    if score is not None and score < 0.9:
        print(f"{k:35} | score={score:4.2f} | {v.get('displayValue', '')}")

print("\n--- TIMELINE EVENTS / TRACE METRICS ---")
net_items = audits.get('network-requests', {}).get('details', {}).get('items', [])
for it in net_items:
    url = it.get('url', '').split('/')[-1] or it.get('url', '')
    size_kb = it.get('transferSize', 0) / 1024
    start = it.get('startTime', 0)
    end = it.get('endTime', 0)
    dur = end - start
    print(f"{url[:40]:40} | {size_kb:8.1f} KB | start={start:5.2f}s | dur={dur:5.2f}s")
