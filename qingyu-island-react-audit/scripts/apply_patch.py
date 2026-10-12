#!/usr/bin/env python3
"""Hash-checked, explicitly invoked source patch. No network or dependency installs.
Usage: python3 apply_patch.py --target PATH --check
       python3 apply_patch.py --target PATH --apply
       python3 apply_patch.py --target PATH --rollback BACKUP_PATH
"""
from __future__ import annotations
import argparse, datetime, hashlib, json, os, shutil, sys, tempfile
from pathlib import Path, PurePosixPath

FORMAT = "qingyu-safe-patch-v1"
def digest(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()
def inside(root: Path, relative: str) -> Path:
    bits = PurePosixPath(relative)
    if bits.is_absolute() or not bits.parts or any(x in ("..", "") for x in bits.parts) or "\\" in relative:
        raise ValueError(f"Unsafe relative path: {relative!r}")
    p = root
    for bit in bits.parts:
        p = p / bit
        if p.is_symlink():
            raise ValueError(f"Symlink is not allowed in patch path: {p}")
    if not p.resolve().is_relative_to(root.resolve()):
        raise ValueError("Path outside target")
    return p
def read_json(p: Path) -> dict:
    value = json.loads(p.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("format") != FORMAT:
        raise ValueError("Unrecognized patch manifest")
    return value
def preflight(root: Path, bundle: Path, manifest: dict) -> None:
    problems=[]
    for rel, expected in manifest["baseline"].items():
        p=inside(root, rel)
        if not p.is_file() or digest(p)!=expected:
            problems.append(f"Baseline mismatch: {rel}")
    for c in manifest["changes"]:
        p=inside(root,c["path"])
        src=inside(bundle,c["payload"])
        if not src.is_file() or digest(src)!=c["after"]:
            problems.append(f"Payload mismatch: {c['path']}")
        if c["before"] is None and p.exists():
            problems.append(f"Added path already exists: {c['path']}")
    if problems:
        raise ValueError("\n".join(problems[:30]) + (f"\n... {len(problems)} conflicts" if len(problems)>30 else ""))
def replace_bytes(target: Path, data: bytes) -> None:
    target.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=".qy-stage-",dir=target.parent)
    try:
        with os.fdopen(fd,"wb") as f:
            f.write(data);f.flush();os.fsync(f.fileno())
        os.replace(tmp,target)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
def apply(root:Path,bundle:Path,m:dict) -> Path:
    preflight(root,bundle,m)
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup=root.parent/(root.name+".qy-backup-"+stamp)
    backup.mkdir()
    for c in m["changes"]:
        if c["before"] is not None:
            src=inside(root,c["path"]);dest=inside(backup/"files",c["path"])
            dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
    record={**m,"target":str(root.resolve()),"backup_created_utc":stamp}
    (backup/"manifest.json").write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf-8")
    preflight(root,bundle,m)
    written=[]
    try:
        for c in m["changes"]:
            target=inside(root,c["path"])
            if c["before"] is not None and digest(target)!=c["before"]:
                raise ValueError(f"Concurrent edit detected: {c['path']}")
            if c["before"] is None and target.exists():
                raise ValueError(f"Concurrent new file detected: {c['path']}")
            replace_bytes(target,inside(bundle,c["payload"]).read_bytes())
            written.append(c)
            if digest(target)!=c["after"]:raise IOError(f"Post-write mismatch: {c['path']}")
    except Exception:
        # Do not silently leave a partly applied patch.
        for c in reversed(written):
            p=inside(root,c["path"])
            if c["before"] is None:
                p.unlink(missing_ok=True)
            else:
                replace_bytes(p,inside(backup/"files",c["path"]).read_bytes())
        raise
    (backup/"APPLIED").write_text("Applied successfully; retain this folder for rollback.\n")
    return backup
def rollback(root:Path,backup:Path) -> None:
    m=read_json(backup/"manifest.json")
    if m.get("target")!=str(root.resolve()):raise ValueError("Backup belongs to a different target")
    for c in m["changes"]:
        p=inside(root,c["path"])
        if not p.is_file() or digest(p)!=c["after"]:
            raise ValueError(f"Rollback would overwrite a later edit: {c['path']}")
        if c["before"] is not None:
            old=inside(backup/"files",c["path"])
            if not old.is_file() or digest(old)!=c["before"]:
                raise ValueError(f"Backup file damaged: {c['path']}")
    for c in reversed(m["changes"]):
        p=inside(root,c["path"])
        if c["before"] is None:p.unlink()
        else:replace_bytes(p,inside(backup/"files",c["path"]).read_bytes())
    (backup/"ROLLED_BACK").write_text("Rollback completed.\n")
def main() -> None:
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--target",required=True,type=Path)
    actions=ap.add_mutually_exclusive_group()
    actions.add_argument("--check",action="store_true")
    actions.add_argument("--apply",action="store_true")
    actions.add_argument("--rollback",type=Path)
    a=ap.parse_args()
    if a.target.is_symlink():raise ValueError("Target itself must not be a symlink")
    root=a.target.resolve()
    if not root.is_dir():raise ValueError("Target directory does not exist")
    lock=root/".qingyu-audit-apply.lock"
    if lock.exists():raise ValueError("A patch lock exists; investigate before continuing")
    if a.rollback:
        lock.mkdir()
        try:rollback(root,a.rollback.resolve());print("ROLLBACK_OK")
        finally:lock.rmdir()
        return
    bundle=Path(__file__).resolve().parent
    m=read_json(bundle/"manifest.json")
    if not a.apply:
        preflight(root,bundle,m)
        print(f"CHECK_OK: {len(m['baseline'])} baseline files; {len(m['changes'])} changed/new files. No files changed.")
        return
    lock.mkdir()
    try:
        backup=apply(root,bundle,m)
        print("APPLY_OK")
        print("BACKUP="+str(backup))
    finally:lock.rmdir()
if __name__=="__main__":
    try:main()
    except Exception as error:
        print("STOP: "+str(error),file=sys.stderr)
        sys.exit(2)
