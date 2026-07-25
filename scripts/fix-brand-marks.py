from pathlib import Path
import re

files = [
    Path("web/index.html"),
    Path("web/consulta.html"),
    Path("web/admin.html"),
]


def replace_imgs(html: str) -> str:
    patterns = [
        (
            r'<img\s*\n?\s*class="brand-mark"\s*\n?\s*src="assets/brand/symbol\.svg"\s*\n?\s*width="\d+"\s*\n?\s*height="\d+"\s*\n?\s*alt=""\s*\n?\s*/>',
            '<span class="brand-mark" data-brand-mark></span>',
        ),
        (
            r'<img\s+class="brand-mark"\s+src="assets/brand/symbol\.svg"\s+width="\d+"\s+height="\d+"\s+alt=""\s*/>',
            '<span class="brand-mark" data-brand-mark></span>',
        ),
        (
            r'<img\s*\n?\s*class="hero__mark"\s*\n?\s*src="assets/brand/symbol\.svg"\s*\n?\s*width="\d+"\s*\n?\s*height="\d+"\s*\n?\s*alt=""\s*\n?\s*/>',
            '<span class="hero__mark" data-brand-mark></span>',
        ),
        (
            r'<img\s*\n?\s*class="cta-band__mark"\s*\n?\s*src="assets/brand/symbol\.svg"\s*\n?\s*width="\d+"\s*\n?\s*height="\d+"\s*\n?\s*alt=""\s*\n?\s*/>',
            '<span class="cta-band__mark" data-brand-mark></span>',
        ),
    ]
    for pattern, repl in patterns:
        html = re.sub(pattern, repl, html, flags=re.IGNORECASE)
    return html


for path in files:
    text = path.read_text(encoding="utf-8")
    before = text.count("assets/brand/symbol.svg")
    text = replace_imgs(text)
    after = text.count("assets/brand/symbol.svg")
    path.write_text(text, encoding="utf-8", newline="\n")
    print(
        f"{path.name}: symbol={before}->{after}, marks={text.count('data-brand-mark')}"
    )
