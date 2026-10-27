import re

# 1. Read fonts.css
with open('assets/fonts/fonts.css', 'r', encoding='utf-8') as f:
    font_face_css = f.read()

# 2. Read style.css
with open('css/style.css', 'r', encoding='utf-8') as f:
    style_css = f.read()

# Check if @font-face already in style.css
if 'Plus Jakarta Sans' not in style_css:
    style_css = font_face_css + '\n\n' + style_css

# Replace font variables in :root
style_css = re.sub(
    r"--font-heading:\s*'Outfit'[^;]+;",
    "--font-heading: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;",
    style_css
)
style_css = re.sub(
    r"--font-body:\s*'Inter'[^;]+;",
    "--font-body: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;\n  --font-primary: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;",
    style_css
)

# Update html font-family
style_css = re.sub(
    r"font-family:\s*var\(--font-body\);",
    "font-family: var(--font-primary);",
    style_css
)

# Update hero-title weight to 800
style_css = re.sub(
    r"(\.hero-title\s*\{[^}]*?font-weight:\s*)900;",
    r"\g<1>800;",
    style_css
)

# Update rating-number weight to 800
style_css = re.sub(
    r"(\.rating-number\s*\{[^}]*?font-weight:\s*)900;",
    r"\g<1>800;",
    style_css
)

# Update cta-heading weight to 800
style_css = re.sub(
    r"(\.cta-heading\s*\{[^}]*?font-weight:\s*)900;",
    r"\g<1>800;",
    style_css
)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(style_css)

print("Updated css/style.css with Plus Jakarta Sans and required weights")
