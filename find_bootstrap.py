
import re

file_path = r'c:\emart-everyday\index.html'
bootstrap_patterns = [
    r'\bcontainer\b', r'\bcontainer-fluid\b',
    r'\brow\b', r'\bcol-\w+',
    r'\bd-\w+',  # d-flex, d-block, d-none etc
    r'\bjustify-content-\w+',
    r'\balign-items-\w+',
    r'\bgap-\d+',
    r'\bm[xybtlr]?-\d+', r'\bp[xybtlr]?-\d+',  # margins and paddings
    r'\btext-\w+',
    r'\bbg-\w+',
    r'\bbtn\b', r'\bbtn-\w+',
    r'\bcarousel\b', r'\bcarousel-\w+',
    r'\bmodal\b',
    r'\bnav\b', r'\bnavbar\b',
    r'\brounded-\w+',
    r'\bborder\b', r'\bborder-\w+'
]

combined_pattern = re.compile('|'.join(bootstrap_patterns))

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

found_lines = []
for i, line in enumerate(lines):
    if 'class="' in line:
        # Extract class attribute content
        classes = re.findall(r'class="([^"]*)"', line)
        for cls_str in classes:
            if combined_pattern.search(cls_str):
                found_lines.append(f"{i+1}: {line.strip()}")
                break

output_path = r'c:\emart-everyday\bootstrap_lines.txt'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(found_lines))

print(f"Found {len(found_lines)} lines with Bootstrap classes.")
