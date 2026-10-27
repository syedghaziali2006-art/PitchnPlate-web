import urllib.request
import re
import os

url = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
req = urllib.request.Request(url, headers=headers)
css_content = urllib.request.urlopen(req).read().decode('utf-8')

# Extract @font-face blocks
blocks = re.findall(r'/\* (.*?) \*/\s*@font-face\s*\{([^}]+)\}', css_content)

fonts_dir = os.path.join('assets', 'fonts')
os.makedirs(fonts_dir, exist_ok=True)

local_css_rules = []

# Focus on latin and latin-ext
for subset, rule in blocks:
    if subset not in ('latin', 'latin-ext'):
        continue
    
    weight_match = re.search(r'font-weight:\s*(\d+);', rule)
    url_match = re.search(r'src:\s*url\((https://[^)]+)\)', rule)
    range_match = re.search(r'unicode-range:\s*([^;]+);', rule)
    
    if weight_match and url_match:
        weight = weight_match.group(1)
        font_url = url_match.group(1)
        unicode_range = range_match.group(1) if range_match else ''
        
        filename = f"plus-jakarta-sans-v12-{subset}-{weight}.woff2"
        filepath = os.path.join(fonts_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(font_url, filepath)
            
        local_rule = f"""@font-face {{
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url('../assets/fonts/{filename}') format('woff2');
  unicode-range: {unicode_range};
}}"""
        local_css_rules.append(local_rule)

with open(os.path.join('assets', 'fonts', 'fonts.css'), 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(local_css_rules))

print("Successfully downloaded local WOFF2 fonts and generated assets/fonts/fonts.css")
