import json

with open('report-pjs.json', encoding='utf-8') as f:
    d = json.load(f)

for k, v in d.get('audits', {}).items():
    score = v.get('score')
    if score is not None and score < 1.0:
        cat = None
        for cname, cval in d.get('categories', {}).items():
            for ref in cval.get('auditRefs', []):
                if ref.get('id') == k:
                    cat = cname
        if cat in ['accessibility', 'performance']:
            print(f"[{cat}] {k}: score={score} - {v.get('title')}")
            for item in v.get('details', {}).get('items', [])[:4]:
                node = item.get('node', {})
                print("   Node:", node.get('snippet', item))
                if 'explanation' in item:
                    print("   Explanation:", item.get('explanation'))
