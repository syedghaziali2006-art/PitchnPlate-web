import os
from PIL import Image

images_dir = os.path.join("assets", "images")

tasks = [
    # (src_name, dst_name, max_width, quality)
    ("cricket-arena-night.png", "cricket-arena-night.webp", 1600, 80),
    ("cricket-arena-night.png", "cricket-arena-night-mobile.webp", 768, 80),
    ("sports-squad.png", "sports-squad.webp", 900, 80),
    ("cricket-bat-turf.png", "cricket-bat-turf.webp", 900, 80),
    ("cafe-dining-screen.png", "cafe-dining-screen.webp", 900, 80),
    ("family-vip-lounge.png", "family-vip-lounge.webp", 900, 80),
    ("entrance-archway.png", "entrance-archway.webp", 900, 80),
    ("pitch-daytime.png", "pitch-daytime.webp", 900, 80),
    ("logo.png", "logo.webp", 200, 85),
]

print(f"{'Image':35} | {'Original Size':14} | {'Optimized Size':14} | {'Savings':8}")
print("-" * 80)

total_orig = 0
total_opt = 0

for src_name, dst_name, max_width, quality in tasks:
    src_path = os.path.join(images_dir, src_name)
    dst_path = os.path.join(images_dir, dst_name)
    
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        continue
        
    orig_size = os.path.getsize(src_path)
    total_orig += orig_size
    
    with Image.open(src_path) as img:
        # Convert RGBA/RGB
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
            
        w, h = img.size
        if w > max_width:
            new_h = int(h * (max_width / w))
            img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
            
        img.save(dst_path, "WEBP", quality=quality, method=6)
        
    opt_size = os.path.getsize(dst_path)
    total_opt += opt_size
    savings = (1 - (opt_size / orig_size)) * 100
    print(f"{dst_name:35} | {orig_size/1024:10.1f} KB | {opt_size/1024:10.1f} KB | {savings:6.1f}%")

print("-" * 80)
print(f"Total: {total_orig/1024/1024:.2f} MB -> {total_opt/1024/1024:.2f} MB (Saved {(1 - total_opt/total_orig)*100:.1f}%)")
