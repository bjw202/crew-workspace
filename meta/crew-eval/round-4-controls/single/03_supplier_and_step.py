# -*- coding: utf-8 -*-
"""남은 갈림길 둘을 본다.
 (1) 하락이 하루 만의 계단인가, 서서히 기운 것인가
 (2) 원인이 '그 한 개(B-0412)'인가 '그 공급사(BSTech) 샤워헤드'인가 — 자료로 갈리나"""
import csv, os, statistics as st
from collections import defaultdict
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
out = []
def p(s=''):
    out.append(str(s)); print(s)
def d(s):
    y, m, dd = s.strip().replace('/', '-').split('-'); return date(int(y), int(m), int(dd))

with open(os.path.join(BASE, 'data', 'yield_by_lot.csv'), encoding='utf-8') as f:
    yl = [dict(r) for r in csv.DictReader(f)]
for r in yl:
    r['d'] = d(r['date']); r['y'] = float(r['yield_pct']); r['pd'] = int(r['particle_defects'])

p('=' * 78)
p('[H] CH-3B 일별 수율·파티클 (07-24 ~ 08-03) — 계단인지 기울기인지')
p('  %-12s %8s %8s %10s %10s' % ('날짜', '로트1', '로트2', '일평균', '파티클평균'))
day = defaultdict(list)
for r in yl:
    if r['chamber'] == 'CH-3B':
        day[r['d']].append(r)
for k in sorted(day):
    if date(2026,7,24) <= k <= date(2026,8,3):
        v = day[k]
        ys = [x['y'] for x in v]
        p('  %-12s %8.2f %8.2f %10.3f %10.1f'
          % (k.isoformat(), ys[0], ys[1] if len(ys) > 1 else float('nan'),
             st.mean(ys), st.mean([x['pd'] for x in v])))
p('  → 07-28 까지 93~94 대, 07-29 부터 90 대. 중간 단계 없음 = 하루 만의 계단')

p('')
p('=' * 78)
p('[I] SH-2200 입고 검사 전체 — 공급사별')
with open(os.path.join(BASE, 'data', 'part_incoming_inspection.csv'), encoding='utf-8') as f:
    pi = [dict(r) for r in csv.DictReader(f)]
seen = set(); uniq = []
for r in pi:
    k = tuple(sorted(r.items()))
    if k in seen: continue
    seen.add(k); uniq.append(r)
p('  (완전 중복 1행 제거: %d → %d 행)' % (len(pi), len(uniq)))
p('')
p('  %-16s %-12s %-11s %9s %6s %s' % ('serial', 'supplier', 'recv_date', 'um환산', '판정', '설치'))
sh = [r for r in uniq if r['part_no'] == 'SH-2200']
by_sup = defaultdict(list)
for r in sorted(sh, key=lambda r: d(r['recv_date'])):
    conv = float(r['measured']) * (1000.0 if r['unit'] == 'mm' else 1.0)
    v = 'NG' if conv > float(r['spec_max']) else 'OK'
    by_sup[r['supplier']].append(conv)
    inst = '%s %s' % (r['install_date'], r['chamber']) if (r['install_date'] or '').strip() else '-'
    p('  %-16s %-12s %-11s %9.2f %6s %s' % (r['serial'], r['supplier'], r['recv_date'], conv, v, inst))
p('')
for s in sorted(by_sup):
    v = by_sup[s]
    p('  %-12s n=%d  hole_dia_sd um: %s  평균 %.2f  최댓값 %.2f'
      % (s, len(v), ['%.2f' % x for x in sorted(v)], st.mean(v), max(v)))
p('')
p('  BSTech 4개 중 NG 1개(4.8), 나머지 2.6~2.9. AlphaParts 4개 중 NG 1개(3.1), 나머지 2.1~2.5.')
p('  → 공급사 단위로는 갈리지 않는다. 설치된 SH-2200 은 딱 2개(B-0412 NG / A-1187 OK)뿐이고,')
p('    그 2개가 공급사도 다르고 판정도 다르므로 "판정" 과 "공급사" 는 이 자료에서 분리되지 않는다.')

p('')
p('[J] 전체 부품 공급사별 규격 초과율 (참고)')
tot = defaultdict(lambda: [0, 0])
for r in uniq:
    conv = float(r['measured']) * (1000.0 if r['unit'] == 'mm' else 1.0)
    ng = conv > float(r['spec_max'])
    s = r['supplier'].strip() or '(공란)'
    tot[s][0] += 1; tot[s][1] += 1 if ng else 0
for s in sorted(tot):
    n, k = tot[s]
    p('  %-12s %d/%d = %.1f%%' % (s, k, n, 100.0*k/n))

p('')
p('[K] hole_dia_sd 값과 챔버 파티클 수준 — 설치된 두 개만 짝지을 수 있다')
p('  %-16s %-7s %-11s %9s %14s %14s %10s' % ('serial','챔버','설치일','um','파티클 전','파티클 후','변화'))
from datetime import timedelta
byc = defaultdict(list)
for r in yl:
    byc[r['chamber']].append(r)
for r in sh:
    if not (r['install_date'] or '').strip(): continue
    conv = float(r['measured']) * (1000.0 if r['unit'] == 'mm' else 1.0)
    dt = d(r['install_date']); ch = r['chamber']
    a = [x['pd'] for x in byc[ch] if dt - timedelta(days=14) <= x['d'] <= dt]
    b = [x['pd'] for x in byc[ch] if dt + timedelta(days=1) <= x['d'] <= dt + timedelta(days=14)]
    p('  %-16s %-7s %-11s %9.2f %14.1f %14.1f %+10.1f' % (r['serial'], ch, r['install_date'], conv, st.mean(a), st.mean(b), st.mean(b)-st.mean(a)))
p('  → n=2. 회귀는 못 낸다. 방향만 일치한다.')

with open(os.path.join(BASE, 'evidence', '03_supplier_and_step.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
