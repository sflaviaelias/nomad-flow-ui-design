#!/usr/bin/env python3
"""Remove credenciais locais dos logs antes de enviá-los ao console do CI."""
import re
import sys


def sanitize(line: str) -> str:
    if re.search(
        r"jwt[ _-]*secret|anon[ _-]*key|service_role[ _-]*key|"
        r"secret[ _-]*(?:access[ _-]*)?key|access[ _-]*key|"
        r"(?:db_password|database_url|api_key)\s*[:=]",
        line,
        re.IGNORECASE,
    ):
        return "[linha de credencial local omitida]\n"
    line = re.sub(r"\beyJ[\w-]*\.[\w-]+\.[\w-]+", "[JWT OMITIDO]", line)
    line = re.sub(r"\bsb_(?:secret|publishable)_[\w-]+", "[CHAVE OMITIDA]", line)
    return re.sub(r"postgres(?:ql)?://[^\s]+", "[URL DO BANCO OMITIDA]", line)


if __name__ == "__main__":
    for entry in sys.stdin:
        print(sanitize(entry), end="", flush=True)
