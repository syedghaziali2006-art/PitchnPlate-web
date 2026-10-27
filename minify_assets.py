import re
import os

def minify_css(css):
    # Remove comments
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    # Remove whitespace
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([\{\}\:\;\,])\s*', r'\1', css)
    css = re.sub(r';\}', '}', css)
    return css.strip()

def minify_js(js):
    # Basic safe JS minify: remove single line and multi-line comments
    js = re.sub(r'/\*[\s\S]*?\*/', '', js)
    lines = []
    for line in js.splitlines():
        line = line.strip()
        if line.startswith('//'):
            continue
        lines.append(line)
    js = '\n'.join(lines)
    return js

# 1. Minify CSS
with open('css/style.css', 'r', encoding='utf-8') as f:
    orig_css = f.read()

min_css = minify_css(orig_css)
with open('css/style.min.css', 'w', encoding='utf-8') as f:
    f.write(min_css)

print(f"CSS: {len(orig_css)/1024:.1f} KB -> {len(min_css)/1024:.1f} KB (Saved {len(orig_css) - len(min_css)} bytes)")

# 2. Minify JS
for js_file in ['intro.js', 'main.js']:
    path = os.path.join('js', js_file)
    min_path = os.path.join('js', js_file.replace('.js', '.min.js'))
    with open(path, 'r', encoding='utf-8') as f:
        orig_js = f.read()
    min_js = minify_js(orig_js)
    with open(min_path, 'w', encoding='utf-8') as f:
        f.write(min_js)
    print(f"{js_file}: {len(orig_js)/1024:.1f} KB -> {len(min_js)/1024:.1f} KB")

