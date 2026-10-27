#!/usr/bin/env python3
"""Portable structural validation, NOT a Salesforce compiler or org-based integration test."""
from pathlib import Path
import json
import subprocess
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
project = json.loads((root / 'sfdx-project.json').read_text(encoding='utf-8'))
assert project['packageDirectories'][0]['path'] == 'force-app'
xmls = list((root / 'force-app').rglob('*.xml'))
for file in xmls:
    ET.parse(file)
assert len(xmls) >= 4, 'Salesforce metadata files missing'
assert 'WITH USER_MODE' in (root / 'force-app/main/default/classes/SalesFlowController.cls').read_text(encoding='utf-8')
for file in (root / 'preview').glob('*.js'):
    subprocess.run(['node', '--check', str(file)], check=True)
assert (root / 'force-app/main/default/lwc/salesFlowDashboard/salesFlowDashboard.html').is_file()
print(f'OK: {len(xmls)} XML metadata files, sfdx-project.json, static JavaScript, project structure')
print('NOTE: deploy and Apex unit tests must be run inside an authenticated Salesforce org.')
