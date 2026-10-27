import json

with open('report-pjs.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

audits = d.get('audits', {})
print("--- Core Metrics ---")
for k in ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index']:
    a = audits.get(k, {})
    print(f"{k:26}: score={a.get('score')} value={a.get('displayValue')}")

print("\n--- Opportunities / Diagnostics ---")
for k, v in audits.items():
    det = v.get('details') or {}
    if det.get('type') == 'opportunity' and (v.get('score') is None or v.get('score') < 0.9):
        print(f"Opportunity: {k:30} saving={v.get('displayValue', '')} score={v.get('score')}")
    elif v.get('score') is not None and v.get('score') < 0.8:
        print(f"Low Audit:   {k:30} value={v.get('displayValue', '')} score={v.get('score')}")
