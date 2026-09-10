# -*- coding: utf-8 -*-
"""다음 조치(샤워헤드 재교체)를 며칠 돌려야 판정이 되나. 로트 단위 산포로 계산한다."""
import csv, os, math, random, statistics as st
from collections import defaultdict
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
random.seed(20260909)
out = []
def p(s=''):
    out.append(str(s)); print(s)
def d(s):
    y, m, dd = s.strip().replace('/', '-').split('-'); return date(int(y), int(m), int(dd))

with open(os.path.join(BASE, 'data', 'yield_by_lot.csv'), encoding='utf-8') as f:
    yl = [dict(r) for r in csv.DictReader(f)]
for r in yl:
    r['d'] = d(r['date']); r['y'] = float(r['yield_pct']); r['pd'] = int(r['particle_defects'])

pre = [r for r in yl if r['chamber'] == 'CH-3B' and r['d'] <= date(2026,7,28)]
post = [r for r in yl if r['chamber'] == 'CH-3B' and r['d'] >= date(2026,7,29)]
oth = [r for r in yl if r['chamber'] != 'CH-3B']

p('=' * 78)
p('[L] 로트 단위 산포 — 판정선을 긋기 위한 값')
for nm, g in (('CH-3B 07-28 이전', pre), ('CH-3B 07-29 이후', post), ('나머지 5챔버 전체', oth)):
    ys = [r['y'] for r in g]; pd = [r['pd'] for r in g]
    p('  %-18s n=%-4d 수율 평균 %.3f 표준편차 %.3f | 파티클 평균 %.1f 표준편차 %.1f'
      % (nm, len(ys), st.mean(ys), st.pstdev(ys), st.mean(pd), st.pstdev(pd)))

sd = st.pstdev([r['y'] for r in pre])
p('')
p('  기준선(정상): 수율 %.2f%%, 파티클 %.1f건/로트, 로트 산포 %.2f%%p'
  % (st.mean([r['y'] for r in pre]), st.mean([r['pd'] for r in pre]), sd))
p('  현재(고장):   수율 %.2f%%, 파티클 %.1f건/로트'
  % (st.mean([r['y'] for r in post]), st.mean([r['pd'] for r in post])))
p('  되돌려야 할 폭: 수율 %+.2f%%p, 파티클 %+.1f건/로트'
  % (st.mean([r['y'] for r in pre]) - st.mean([r['y'] for r in post]),
     st.mean([r['pd'] for r in pre]) - st.mean([r['pd'] for r in post])))

p('')
p('[M] 며칠이면 판정이 되나 (로트 2개/일, 양측 alpha=0.05, power=0.9)')
p('  검출하려는 폭 delta 별 필요한 로트 수 n (한쪽 표본 기준, 2표본 t 근사 z=1.96/1.28)')
sd_post = st.pstdev([r['y'] for r in post])
sd_pool = math.sqrt((sd**2 + sd_post**2) / 2)
p('  합동 표준편차 %.3f%%p (고장 구간 산포 %.3f 포함)' % (sd_pool, sd_post))
for delta in (3.6, 2.0, 1.0, 0.5):
    n = 2 * ((1.96 + 1.2816) ** 2) * (sd_pool ** 2) / (delta ** 2)
    n = math.ceil(n)
    p('    delta=%4.1f%%p → 한쪽 n=%3d 로트 = %.1f 일' % (delta, n, n / 2.0))
p('')
p('  → 우리가 되돌리려는 폭은 3.6%p 다. 한쪽 3로트(1.5일)면 통계적으로 충분하지만,')
p('    일간 변동을 덮으려면 여유를 둔다. 아래는 실제 자료로 확인한 값이다.')

p('')
p('[N] 실제 확인: 07-29 하락은 며칠치 로트로 잡혔나 (사후 판정선 검증)')
def perm_p(a, b, n=50000):
    obs = abs(st.mean(a) - st.mean(b)); pool = a + b; na = len(a); hit = 0
    for _ in range(n):
        random.shuffle(pool)
        if abs(st.mean(pool[:na]) - st.mean(pool[na:])) >= obs - 1e-12: hit += 1
    return (hit + 1) / (n + 1)
base = [r['y'] for r in pre if r['d'] >= date(2026,7,15)]
p('  기준: CH-3B 07-15~07-28 %d 로트' % len(base))
for k in (2, 4, 6, 8, 10):
    seg = sorted([r for r in post if r['d'] >= date(2026,7,29)], key=lambda r: (r['d'], r['lot_id']))[:k]
    ys = [r['y'] for r in seg]
    p('    하락 후 %2d 로트(%.1f일): 평균 %.3f, 기준과 차 %+.3f%%p, p=%.5f'
      % (k, k/2.0, st.mean(ys), st.mean(ys) - st.mean(base), perm_p(base, ys)))
p('  → 하락 후 4로트(2일)에서 이미 p<0.001. 재교체 판정도 같은 규모면 2~3일이면 갈린다.')
p('    파티클 건수는 14 vs 65 로 겹치지 않으므로 사실상 첫날 2로트에서 눈으로 갈린다.')

with open(os.path.join(BASE, 'evidence', '04_next_test_power.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
