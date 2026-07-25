from pathlib import Path
import re

SVG_TEMPLATE = """<svg class="{cls}" viewBox="0 0 64 64" width="{w}" height="{h}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="{gid}" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0E2433"/>
                  <stop offset="0.55" stop-color="#157A8C"/>
                  <stop offset="1" stop-color="#1A9AA8"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="16" fill="url(#{gid})"/>
              <path fill="#FFFFFF" d="M18 34.5 32 22l14 12.5V46a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V34.5Z"/>
              <path fill="#0E2433" opacity="0.18" d="M28 49h8v-9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v9Z"/>
              <path fill="none" stroke="#F0A202" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M14 18c8-6 18-6 28 1"/>
              <path fill="#F0A202" d="M40.2 14.4 48.5 19l-6.8 5.2 1.2-4.6 4.1-.8-6.8-4.4Z"/>
            </svg>"""

counter = 0


def next_mark(cls: str, w: int, h: int) -> str:
    global counter
    counter += 1
    return SVG_TEMPLATE.format(cls=cls, w=w, h=h, gid=f"smMark{counter}")


def replace_file(path: Path) -> None:
    global counter
    text = path.read_text(encoding="utf-8")

    # Replace empty data-brand-mark spans
    def repl_span(match: re.Match) -> str:
        cls = match.group(1)
        size = 52 if "hero" in cls else 48 if "cta" in cls else 40
        if path.name == "consulta.html" or path.name == "admin.html":
            size = 40
        return next_mark(cls, size, size)

    text = re.sub(
        r'<span class="(brand-mark|hero__mark|cta-band__mark)" data-brand-mark></span>',
        repl_span,
        text,
    )

    # Also catch any remaining img symbol references
    text = re.sub(
        r'<img[^>]*src="assets/brand/symbol\.svg"[^>]*/?>',
        lambda m: next_mark("brand-mark", 40, 40),
        text,
        flags=re.I,
    )

    path.write_text(text, encoding="utf-8", newline="\n")
    print(path.name, "inline marks ok, last id", counter)


for file_path in [
    Path("web/index.html"),
    Path("web/consulta.html"),
    Path("web/admin.html"),
]:
    replace_file(file_path)
