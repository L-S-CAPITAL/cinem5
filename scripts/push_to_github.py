#!/usr/bin/env python3
"""Upload the full CineM5 tree to GitHub via the Contents API.

Usage:
  export GITHUB_TOKEN=ghp_xxxxxxxx   # classic or fine-grained with contents:write
  python3 scripts/push_to_github.py

Skips binary .jpg (use .jpg.b64 sidecars instead). Skips .git and index.min.html.
"""
from __future__ import annotations

import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
if not TOKEN:
    sys.exit("Set GITHUB_TOKEN (or GH_TOKEN) with repo contents:write scope")

OWNER, REPO, BRANCH = "L-S-CAPITAL", "cinem5", "main"
ROOT = Path(__file__).resolve().parent.parent  # cinem5/


def api(method: str, url: str, data: bytes | None = None) -> dict:
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "cinem5-push",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read().decode()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise SystemExit(f"{method} {url} -> {e.code}\n{err}") from e


def get_sha(path: str) -> str | None:
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "cinem5-push",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode()).get("sha")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def put_file(path: Path) -> None:
    rel = path.relative_to(ROOT).as_posix()
    raw = path.read_bytes()
    content_b64 = base64.b64encode(raw).decode("ascii")
    sha = get_sha(rel)
    payload: dict = {
        "message": f"{'Update' if sha else 'Add'} {rel}",
        "content": content_b64,
        "branch": BRANCH,
    }
    if sha:
        payload["sha"] = sha
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{rel}"
    api("PUT", url, json.dumps(payload).encode())
    print(f"OK  {rel}  ({len(raw)} bytes)")


def main() -> None:
    files: list[Path] = []
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if ".git" in p.parts:
            continue
        if p.suffix == ".jpg":
            continue  # binary; app falls back to .jpg.b64
        if p.name == "index.min.html":
            continue
        files.append(p)
    files.sort()
    print(f"Uploading {len(files)} text files to {OWNER}/{REPO}@{BRANCH} ...")
    for p in files:
        put_file(p)
    print("DONE")
    print(f"https://github.com/{OWNER}/{REPO}")


if __name__ == "__main__":
    main()
