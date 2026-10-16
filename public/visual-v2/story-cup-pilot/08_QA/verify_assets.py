#!/usr/bin/env python3
# Python standard library only. Audit complete bytes of the exact folder.
import hashlib,json,sys
from pathlib import Path
from xml.etree import ElementTree as ET
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'08_QA/manifest.json').read_text())
fail=[]
for entry in data['files']:
 p=root/entry['path']
 if not p.is_file():fail.append('MISSING '+entry['path']);continue
 if len(p.read_bytes())!=entry['size_bytes']:fail.append('SIZE '+entry['path'])
 if hashlib.sha256(p.read_bytes()).hexdigest()!=entry['sha256']:fail.append('HASH '+entry['path'])
 if p.suffix=='.svg':
  try:ET.parse(p)
  except Exception as e:fail.append('SVG '+entry['path']+' '+str(e))
print(json.dumps({'verified_count':len(data['files']),'fail_count':len(fail),'failures':fail,'artDirectorGate':'ART_DIRECTOR_QA_HOLD'},indent=2))
sys.exit(1 if fail else 0)
