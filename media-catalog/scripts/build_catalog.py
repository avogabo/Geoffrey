import json, os, pathlib, re
from collections import defaultdict

ROOT = pathlib.Path('/mnt/user/Nubes/EDR/inbox/media')
OUT = pathlib.Path('/home/pulgarcito/.openclaw/workspace/media-catalog/data/catalog.json')
VIDEO_EXTS = {'.mkv', '.mp4', '.avi', '.m2ts', '.ts'}

items = {}

def infer_quality(name: str) -> str:
    s = name.lower()
    if '4k' in s or '2160' in s:
        return '4K'
    if '1080' in s:
        return '1080p'
    if '720' in s:
        return '720p'
    return '1080p'

for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    rel = pathlib.Path(root).relative_to(ROOT)
    if str(rel) == '.':
        continue
    video_files = [f for f in files if not f.startswith('.') and pathlib.Path(f).suffix.lower() in VIDEO_EXTS]
    if not video_files:
        continue
    parts = rel.parts
    title = parts[0]
    match = re.match(r'^(.*) \((\d{4})\)$', title)
    clean_title = match.group(1) if match else title
    year = int(match.group(2)) if match else None
    item = items.setdefault(title, {
        'id': re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-'),
        'title': clean_title,
        'year': year,
        'type': 'series' if len(parts) > 1 else 'movie',
        'quality': infer_quality(str(rel)),
        'seasons': defaultdict(lambda: {'episodes': [], 'count': 0}),
        'paths': [],
        'variants': [],
        'poster': None,
        'backdrop': None,
        'synopsis': 'Pendiente de enriquecer con TMDB / metadata externa.',
        'genres': [],
    })
    item['paths'].append('/' + str(rel))
    if len(parts) > 1 and re.match(r'(?i)^temporada\s+(\d+)$', parts[1]):
        season_num = int(re.match(r'(?i)^temporada\s+(\d+)$', parts[1]).group(1))
        season = item['seasons'][str(season_num)]
        for f in sorted(video_files):
            season['episodes'].append(f)
        season['count'] = len(season['episodes'])
    else:
        for f in sorted(video_files):
            item['variants'].append(f)

catalog = []
for item in items.values():
    seasons = []
    for num, info in sorted(item['seasons'].items(), key=lambda x: int(x[0])):
        seasons.append({'season': int(num), 'episodeCount': info['count'], 'episodes': info['episodes']})
    item['seasonCount'] = len(seasons)
    item['seasons'] = seasons
    catalog.append(item)

catalog.sort(key=lambda x: (x['title'].lower(), x.get('year') or 0))
OUT.write_text(json.dumps({'generatedFrom': str(ROOT), 'count': len(catalog), 'items': catalog}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'catalog items: {len(catalog)} -> {OUT}')
