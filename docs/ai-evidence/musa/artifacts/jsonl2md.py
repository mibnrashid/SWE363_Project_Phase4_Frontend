"""Convert a Claude Code .jsonl transcript into a readable Markdown file.
Usage: python jsonl2md.py <in.jsonl> <out.md>
"""
import json, sys

LIMIT = 4000  # max chars shown per tool input/result in the readable copy


def clip(s):
    s = s if isinstance(s, str) else json.dumps(s, ensure_ascii=False, indent=1)
    return s if len(s) <= LIMIT else s[:LIMIT] + f"\n... [{len(s) - LIMIT} more characters in the raw .jsonl]"


def text_of(content):
    if isinstance(content, str):
        return content
    out = []
    for c in content or []:
        if isinstance(c, dict) and c.get("type") == "text":
            out.append(c.get("text", ""))
    return "\n".join(out)


def main(src, dst):
    lines = []
    first_ts = None
    with open(src, encoding="utf-8") as f:
        for raw in f:
            try:
                e = json.loads(raw)
            except json.JSONDecodeError:
                continue
            t = e.get("type")
            if t not in ("user", "assistant"):
                continue
            msg = e.get("message") or {}
            ts = e.get("timestamp", "")
            first_ts = first_ts or ts
            content = msg.get("content")
            if t == "user":
                if isinstance(content, list) and any(isinstance(c, dict) and c.get("type") == "tool_result" for c in content):
                    for c in content:
                        if isinstance(c, dict) and c.get("type") == "tool_result":
                            body = c.get("content")
                            body = text_of(body) if isinstance(body, list) else body
                            lines.append(f"<details><summary>Tool result</summary>\n\n```\n{clip(body or '')}\n```\n</details>\n")
                else:
                    txt = text_of(content).strip()
                    if txt:
                        lines.append(f"## 🧑 User  <sub>{ts}</sub>\n\n{txt}\n")
            else:
                for c in content or []:
                    if not isinstance(c, dict):
                        continue
                    if c.get("type") == "text" and c.get("text", "").strip():
                        lines.append(f"## 🤖 Claude  <sub>{ts}</sub>\n\n{c['text']}\n")
                    elif c.get("type") == "tool_use":
                        lines.append(f"**Tool call: `{c.get('name')}`**\n\n```json\n{clip(c.get('input'))}\n```\n")
    header = (f"# Claude Code conversation\n\nSource file: `{src.replace(chr(92), '/').split('/')[-1]}`  \n"
              f"Started: {first_ts}\n\nReadable copy. Long tool inputs/results are shortened here; "
              f"the raw .jsonl next to this file is the full, unmodified conversation.\n\n---\n\n")
    with open(dst, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(lines))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
