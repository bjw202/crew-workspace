# -*- coding: utf-8 -*-
"""자료 흠 점검. 세 CSV 를 원문 그대로 읽어 형식·중복·결측·단위·규격초과를 센다."""
import csv, os, sys
from collections import Counter, defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(BASE, 'data')
out = []
def p(s=''):
    out.append(str(s)); print(s)

def rows(name):
    with open(os.path.join(D, name), encoding='utf-8') as f:
        return list(csv.DictReader(f))

yl = rows('yield_by_lot.csv')
eq = rows('equipment_history.csv')
pi = rows('part_incoming_inspection.csv')

p('=' * 70)
p('[1] 행 수')
p('  yield_by_lot            %d 행' % len(yl))
p('  equipment_history       %d 행' % len(eq))
p('  part_incoming_inspection %d 행' % len(pi))

p('')
p('[2] 날짜 형식 이상 (YYYY-MM-DD 아닌 것)')
bad = 0
for tag, tbl, cols in (('yield', yl, ['date']),
                       ('equip', eq, ['date']),
                       ('part', pi, ['recv_date', 'install_date'])):
    for i, r in enumerate(tbl, start=2):
        for c in cols:
            v = (r.get(c) or '').strip()
            if not v:
                continue
            if len(v) != 10 or v[4] != '-' or v[7] != '-':
                p('  %s L%d %s = %r' % (tag, i, c, v)); bad += 1
p('  → 이상 %d 건' % bad)

p('')
p('[3] 완전 중복 행')
for tag, tbl in (('yield', yl), ('equip', eq), ('part', pi)):
    seen = defaultdict(list)
    for i, r in enumerate(tbl, start=2):
        seen[tuple(sorted(r.items()))].append(i)
    dups = {k: v for k, v in seen.items() if len(v) > 1}
    p('  %s: %d 쌍' % (tag, len(dups)))
    for k, v in dups.items():
        d = dict(k)
        p('    L%s  %s' % (v, {kk: d[kk] for kk in list(d)[:6]}))

p('')
p('[4] part: serial 중복 (같은 부품 번호가 두 번)')
c = Counter(r['serial'] for r in pi)
for s, n in c.items():
    if n > 1:
        p('  %s × %d' % (s, n))

p('')
p('[5] 결측 칸 (install_date/chamber 는 미설치 뜻이므로 제외 집계)')
for tag, tbl in (('yield', yl), ('equip', eq), ('part', pi)):
    miss = Counter()
    for r in tbl:
        for k, v in r.items():
            if k in ('install_date', 'chamber'):
                continue
            if v is None or str(v).strip() == '':
                miss[k] += 1
    p('  %s: %s' % (tag, dict(miss) or '없음'))
# install_date/chamber 는 짝이 맞아야 한다
p('  part: install_date 와 chamber 짝 안 맞는 행:')
n = 0
for i, r in enumerate(pi, start=2):
    a = bool((r['install_date'] or '').strip()); b = bool((r['chamber'] or '').strip())
    if a != b:
        p('    L%d install=%r chamber=%r' % (i, r['install_date'], r['chamber'])); n += 1
p('    → %d 건' % n)

p('')
p('[6] part: 단위 뒤섞임 (같은 spec_item 안에서)')
u = defaultdict(Counter)
for r in pi:
    u[r['spec_item']][r['unit']] += 1
for k, v in sorted(u.items()):
    flag = '  ← 뒤섞임' if len(v) > 1 else ''
    p('  %-15s %s%s' % (k, dict(v), flag))

p('')
p('[7] part: 규격 초과 판정 (단위 um 기준으로 mm 는 ×1000 환산)')
p('  %-16s %-9s %-14s %-8s %8s %8s %6s %s' % ('serial', 'part_no', 'spec_item', 'unit', 'measured', '환산', 'max', '판정/설치'))
oos = []
for r in pi:
    meas = float(r['measured']); mx = float(r['spec_max']); unit = r['unit']
    conv = meas * 1000.0 if unit == 'mm' else meas
    verdict = 'NG' if conv > mx else 'OK'
    inst = ('설치 %s %s' % (r['install_date'], r['chamber'])) if (r['install_date'] or '').strip() else '미설치'
    if verdict == 'NG':
        oos.append((r, conv))
    p('  %-16s %-9s %-14s %-8s %8s %8.4f %6s %s %s'
      % (r['serial'], r['part_no'], r['spec_item'], unit, r['measured'], conv, r['spec_max'], verdict, inst))
p('')
p('  규격 초과 %d 건 (중복행 포함):' % len(oos))
for r, conv in oos:
    inst = ('설치 %s → %s' % (r['install_date'], r['chamber'])) if (r['install_date'] or '').strip() else '미설치 (재고)'
    p('    %s %s %s=%s%s (max %s) — %s'
      % (r['serial'], r['part_no'], r['spec_item'], r['measured'], r['unit'], r['spec_max'], inst))

p('')
p('[8] equip: 같은 뜻 다른 표기 (detail 문자열)')
c = Counter(r['detail'] for r in eq)
for k, v in sorted(c.items()):
    if 'SH-2200' in k or 'howerhead' in k or '샤워헤드' in k:
        p('  %r × %d' % (k, v))

p('')
p('[9] equip: 설비 이력 기간 vs 수율 기간')
p('  equip  %s ~ %s' % (min(r['date'].replace('/', '-') for r in eq), max(r['date'].replace('/', '-') for r in eq)))
p('  yield  %s ~ %s' % (min(r['date'] for r in yl), max(r['date'] for r in yl)))
p('  → 08-21~08-25 수율 구간에 대응하는 설비 이력이 없다 (이력 누락 가능)')

p('')
p('[10] part 교체 이력 ↔ 입고 검사 대조 (equip 의 PART 이벤트마다 성적서가 있나)')
insp_by_ch = defaultdict(list)
for r in pi:
    if (r['install_date'] or '').strip():
        insp_by_ch[(r['install_date'].replace('/', '-'), r['chamber'])].append(r['serial'])
for r in eq:
    if r['event_type'] != 'PART':
        continue
    key = (r['date'].replace('/', '-'), r['chamber'])
    p('  %s %s %-28s → 성적서 %s' % (r['date'], r['chamber'], r['detail'], insp_by_ch.get(key) or '없음 ←'))
p('')
p('  역방향: 성적서에 설치 기록이 있는데 equip 에 PART 이벤트가 없는 것')
eqpart = {(r['date'].replace('/', '-'), r['chamber']) for r in eq if r['event_type'] == 'PART'}
for k, v in sorted(insp_by_ch.items()):
    if k not in eqpart:
        p('    %s %s %s ←' % (k[0], k[1], v))
    else:
        p('    %s %s %s (짝 있음)' % (k[0], k[1], v))

with open(os.path.join(BASE, 'evidence', '01_data_audit.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
