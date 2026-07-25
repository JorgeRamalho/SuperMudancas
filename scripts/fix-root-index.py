from pathlib import Path

# Keep web/ for Docker (/cadastro/). Root index is Live Server entry.
web = Path("web/index.html").read_text(encoding="utf-8")
# Ensure web still uses /cadastro/ for API/Docker
if "../client/dist/index.html" in web:
    web = web.replace('href="../client/dist/index.html"', 'href="/cadastro/"')
    Path("web/index.html").write_text(web, encoding="utf-8", newline="\n")

root = Path("web/index.html").read_text(encoding="utf-8")
needle = '<meta charset="UTF-8" />'
base = '<meta charset="UTF-8" />\n    <base href="web/" />'
if "<base " not in root:
    root = root.replace(needle, base, 1)
root = root.replace('href="/cadastro/"', 'href="../client/dist/index.html"')
Path("index.html").write_text(root, encoding="utf-8", newline="\n")
print("root ok", "Mudanças" in Path("index.html").read_text(encoding="utf-8"))
print("web cadastro", Path("web/index.html").read_text(encoding="utf-8").count('href="/cadastro/"'))
