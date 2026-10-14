"""Package the tested game and optional editable art without nested downloads."""
from pathlib import Path
import hashlib
import json
import os
import zipfile

APP = Path(__file__).resolve().parents[1]
VERSION = json.loads((APP / 'package.json').read_text())['version']
PREFIX = Path(f'Astrub-v{VERSION}')
EXCLUDED = {'node_modules', 'downloads', '.git', '.codex', '.agents', '__pycache__',
            'ui-checks', '.pytest_cache', '.cache'}


def files():
    for root, dirs, names in os.walk(APP):
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDED)
        for name in sorted(names):
            if name.endswith(('.pyc', '.log', '.zip')) or name == '.DS_Store' or name.startswith('.env'):
                continue
            path = Path(root) / name
            if path.is_symlink():
                raise ValueError(f'Unexpected symbolic link: {path}')
            yield path, path.relative_to(APP)


def archive(name, entries, required):
    target = APP / 'downloads' / name
    target.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for path, relative in entries:
            z.write(path, PREFIX / relative)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None, 'ZIP integrity failed'
        names = z.namelist()
        assert all(n.startswith(str(PREFIX) + '/') for n in names)
        assert not any('/downloads/' in n or '/node_modules/' in n for n in names)
        for relative in required:
            assert str(PREFIX / relative) in names, relative
    assert target.stat().st_size < 100 * 1024 * 1024, 'GitHub file size limit exceeded'
    return {'name': name, 'bytes': target.stat().st_size, 'files': len(names),
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'integrity': 'passed'}


if __name__ == '__main__':
    report = json.loads((APP / 'RESULTATS_VERIFICATION.json').read_text())
    assert report['version'] == VERSION
    assert report['unit_tests']['failed'] == 0 and report['build'] == 'passed'
    assert report['production_smoke']['status'] == 'passed'
    assert len(report['browser']) == 3
    assert all(r['result'] == 'PASS' and not r['pageerrors'] and not r['failed_requests'] for r in report['browser'])
    all_files = list(files())
    game_files = [(p, r) for p, r in all_files if r.parts[:2] not in [('art', 'source'), ('art', 'reference')]]
    art_files = [(p, r) for p, r in all_files if r.parts[0] == 'art'
        or (r.parts[0] == 'APERCUS' and r.name.startswith('Sprites-')) or str(r) in {
        'ART_PIPELINE.md', 'SOURCES_ASSETS.md', 'README.md', 'tools/pack_generated_sprites.py',
        'tools/test_pack_generated_sprites.py', 'tools/sprite-recipe.example.json',
        'tools/sprite-recipe.building.example.json'}]
    results = [archive(f'Astrub-v{VERSION}.zip', game_files, [
        'package.json', 'package-lock.json', 'README.md', 'DEMARRER_WINDOWS.bat', 'dist/index.html',
        'public/assets/sprites/manifest.json', 'public/assets/buildings/animated/manifest.json',
        'src/game/buildingAnimations.js', 'APERCUS/Village-anime.gif', 'RESULTATS_VERIFICATION.json']),
        archive(f'Astrub-art-v{VERSION}.zip', art_files, [
            'ART_PIPELINE.md', 'tools/pack_generated_sprites.py',
            f'art/recipes/v{VERSION}/characters.json', f'art/recipes/v{VERSION}/buildings.json',
            f'art/recipes/v{VERSION}/decor.json', f'art/source/v{VERSION}/villager-source.png'])]
    print(json.dumps(results, ensure_ascii=False, indent=2))
