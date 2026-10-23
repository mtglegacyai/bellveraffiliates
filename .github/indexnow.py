# -*- coding: utf-8 -*-
"""IndexNow: after each publish, tell Bing (and the other IndexNow search engines) which of MTG's pages changed.
Runs on GitHub Actions (.github/workflows/indexnow.yml). Team clones are noindex, so they are never sent.
Source of truth: musathegiant/cards/bellvercards/_build/bva_github/ (copied here by the builder)."""
import json, os, subprocess, sys, urllib.request, urllib.error

KEY = 'c7c081f562af7523a3903b1e622f166c'
HOST = 'bellveraffiliates.com'

changed = subprocess.run(['git', 'diff', '--name-only', 'HEAD^', 'HEAD'], capture_output=True, text=True).stdout.split()
urls = []
if os.environ.get('GITHUB_EVENT_NAME') == 'workflow_dispatch':     # run by hand: send every page in the sitemap
    import re
    urls = re.findall(r'<loc>([^<]+)</loc>', open('sitemap.xml', encoding='utf-8').read())
    changed = []
for name in changed:
    if not name.endswith('index.html') or not os.path.exists(name):
        continue
    if 'noindex' in open(name, encoding='utf-8').read(4000):
        continue          # team clones and redirect pages: not for search engines
    urls.append(f'https://{HOST}/' + name[:-len('index.html')])
if not urls:
    print('No search-visible page changed in this publish: nothing to send.')
    sys.exit(0)

body = json.dumps({'host': HOST, 'key': KEY, 'keyLocation': f'https://{HOST}/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print('IndexNow answered', r.status, 'for', len(urls), 'page(s):', *urls, sep='\n  ')
except urllib.error.HTTPError as e:
    print('IndexNow answered', e.code, e.read()[:300])
    sys.exit(1)
