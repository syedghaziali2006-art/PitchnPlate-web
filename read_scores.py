import json
import sys

filename = sys.argv[1] if len(sys.argv) > 1 else 'report-pjs.json'
with open(filename, encoding='utf-8') as f:
    r = json.load(f)

c = r['categories']
print("================ LIGHTHOUSE FINAL RESULTS ================")
print(f"Performance:    {c['performance']['score']*100:.0f} / 100")
print(f"Accessibility:  {c['accessibility']['score']*100:.0f} / 100")
print(f"Best Practices: {c['best-practices']['score']*100:.0f} / 100")
print(f"SEO:            {c['seo']['score']*100:.0f} / 100")
print("----------------------------------------------------------")
aud = r['audits']
for m in ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index']:
    print(f"{m:26}: {aud[m].get('displayValue', '')}")
print("==========================================================")
