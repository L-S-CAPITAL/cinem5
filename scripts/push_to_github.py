#!/usr/bin/env python3
import os, sys, json, base64, urllib.request, urllib.error
from pathlib import Path

TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
if not TOKEN:
    sys.exit("Set GITHUB_TOKEN")
OWNER, REPO, BRANCH = "L-S-CAPITAL", "cinem5", "main"
ROOT = Path(__file__).resolve().parent

def api(method, url, data=None):
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cinem5-push",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise SystemExit(f"{method} {url} -> {e.code} {body}")

def get_sha(path):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}?ref={BRANCH}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "cinem5-push",
    })
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode()).get("sha")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise

def put_file(path: Path):
    rel = path.relative_to(ROOT).as_posix()
    raw = path.read_bytes()
    content_b64 = base64.b64encode(raw).decode("ascii")
    sha = get_sha(rel)
    payload = {
        "message": f"Add {rel}",
        "content": content_b64,
        "branch": BRANCH,
    }
    if sha:
        payload["sha"] = sha
        payload["message"] = f"Update {rel}"
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{rel}"
    api("PUT", url, json.dumps(payload).encode())
    print("OK", rel, len(raw))

def main():
    files = []
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if ".git" in p.parts:
            continue
        if p.name == "index.min.html":
            continue
        files.append(p)
    files.sort()
    print(f"Uploading {len(files)} files...")
    for p in files:
        put_file(p)
    print("DONE")

if __name__ == "__main__":
    main()
