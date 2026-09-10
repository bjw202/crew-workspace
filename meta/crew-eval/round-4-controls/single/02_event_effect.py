# -*- coding: utf-8 -*-
"""설비 이벤트별 전후 수율 변화. PM 여섯 번과 부품 교체 네 번을 같은 잣대로 잰다.
검정은 순열검정(permutation test) — scipy 가 이 환경에서 깨져 있어 표준 라이브러리로 구현했다."""
import csv, os, random, statistics as st
from collections import defaultdict
from datetime import date, timedelta

BASE = os.path.dirname(os.path.abspath(__file__))
random.seed(20260909)
out = []
def p(s=''):
    out.append(str(s)); print(s)

def d(s):
    s = s.strip().replace('/', '-')
    y, m, dd = s.split('-')
    return date(int(y), int(m), int(dd))

with open(os.path.join(BASE, 'data', 'yield_by_lot.csv'), encoding='utf-8') as f:
    yl = [dict(r) for r in csv.DictReader(f)]
for r in yl:
    r['d'] = d(r['date']); r['y'] = float(r['yield_pct'])
    r['dc'] = int(r['defect_count']); r['pd'] = int(r['particle_defects'])

with open(os.path.join(BASE, 'data', 'equipment_history.csv'), encoding='utf-8') as f:
    eq = [dict(r) for r in csv.DictReader(f)]
for r in eq:
    r['d'] = d(r['date'])

by_ch = defaultdict(list)
for r in yl:
    by_ch[r['chamber']].append(r)
for v in by_ch.values():
    v.sort(key=lambda r: (r['d'], r['lot_id']))

DMIN = min(r['d'] for r in yl); DMAX = max(r['d'] for r in yl)

def win(ch, a, b, key='y'):
    """[a, b] 양끝 포함 구간의 값들"""
    return [r[key] for r in by_ch[ch] if a <= r['d'] <= b]

def perm_p(a, b, n=200000):
    """두 표본 평균차의 양측 순열검정 p"""
    if not a or not b:
        return float('nan')
    obs = abs(st.mean(a) - st.mean(b))
    pool = a + b; na = len(a)
    hit = 0
    for _ in range(n):
        random.shuffle(pool)
        if abs(st.mean(pool[:na]) - st.mean(pool[na:])) >= obs - 1e-12:
            hit += 1
    return (hit + 1) / (n + 1)

p('=' * 78)
p('[A] 챔버별 07-28 기준 전후 수율 (전: 07-14~07-28, 후: 07-29~08-11, 각 14일)')
p('    07-28 은 정비 당일이므로 "전" 에 넣는다 (그날 로트는 정비 전 물량으로 본다)')
p('')
p('  %-7s %6s %8s %6s %8s %9s %10s' % ('챔버', 'n전', '평균전', 'n후', '평균후', '변화(%p)', 'p(순열)'))
E = date(2026, 7, 28)
res28 = {}
for ch in sorted(by_ch):
    a = win(ch, E - timedelta(days=14), E)
    b = win(ch, E + timedelta(days=1), E + timedelta(days=14))
    delta = st.mean(b) - st.mean(a)
    pv = perm_p(a, b, 50000)
    res28[ch] = delta
    p('  %-7s %6d %8.3f %6d %8.3f %+9.3f %10.5f' % (ch, len(a), st.mean(a), len(b), st.mean(b), delta, pv))

p('')
p('[B] CH-3B: 07-28 이후 회복이 있나 (07-29 부터 끝까지 vs 07-01~07-28)')
for ch in ['CH-3B', 'CH-3A']:
    pre = win(ch, DMIN, E)
    post = win(ch, E + timedelta(days=1), DMAX)
    p('  %s  전(07-01~07-28) n=%d 평균 %.3f  |  후(07-29~08-25) n=%d 평균 %.3f  변화 %+.3f%%p  p=%.6f'
      % (ch, len(pre), st.mean(pre), len(post), st.mean(post), st.mean(post) - st.mean(pre), perm_p(pre, post, 50000)))

p('')
p('  CH-3B 주별 평균 (08-10 특별 세정 180분 뒤 회복 여부 확인)')
p('  %-24s %5s %9s %9s %9s' % ('구간', 'n', '수율평균', '불량평균', '파티클평균'))
segs = [('07-01~07-14', date(2026,7,1), date(2026,7,14)),
        ('07-15~07-28 (정비 전)', date(2026,7,15), date(2026,7,28)),
        ('07-29~08-04', date(2026,7,29), date(2026,8,4)),
        ('08-05~08-09 (특별세정 전)', date(2026,8,5), date(2026,8,9)),
        ('08-10 특별세정 당일', date(2026,8,10), date(2026,8,10)),
        ('08-11~08-17 (세정 후)', date(2026,8,11), date(2026,8,17)),
        ('08-18~08-25', date(2026,8,18), date(2026,8,25))]
for nm, a, b in segs:
    ys = win('CH-3B', a, b); dcs = win('CH-3B', a, b, 'dc'); pds = win('CH-3B', a, b, 'pd')
    if not ys:
        p('  %-24s %5d %9s' % (nm, 0, '자료없음')); continue
    p('  %-24s %5d %9.3f %9.1f %9.1f' % (nm, len(ys), st.mean(ys), st.mean(dcs), st.mean(pds)))

p('')
p('  CH-3B 파티클 불량이 전체 불량 증가분에서 차지하는 몫')
pre_dc = win('CH-3B', DMIN, E, 'dc'); post_dc = win('CH-3B', E+timedelta(days=1), DMAX, 'dc')
pre_pd = win('CH-3B', DMIN, E, 'pd'); post_pd = win('CH-3B', E+timedelta(days=1), DMAX, 'pd')
ddc = st.mean(post_dc) - st.mean(pre_dc); dpd = st.mean(post_pd) - st.mean(pre_pd)
p('    전체 불량 로트당 평균  %.1f → %.1f  (%+.1f)' % (st.mean(pre_dc), st.mean(post_dc), ddc))
p('    파티클 불량 로트당 평균 %.1f → %.1f  (%+.1f)' % (st.mean(pre_pd), st.mean(post_pd), dpd))
p('    증가분 중 파티클 몫 %.1f%%' % (100.0 * dpd / ddc if ddc else float('nan')))
p('    파티클 외 불량 변화 %+.1f 건/로트' % (ddc - dpd))

p('')
p('=' * 78)
p('[C] PM(정기 정비) 여섯 번을 같은 잣대로 — 각 챔버 자기 PM 날짜 기준 전후 14일')
p('  %-7s %-11s %6s %8s %6s %8s %9s %10s %s' % ('챔버','PM날짜','n전','평균전','n후','평균후','변화(%p)','p(순열)','같은날 부품교체'))
pm = [(r['chamber'], r['d']) for r in eq if r['event_type'] == 'PART' or r['event_type'] == 'PM']
pmrows = sorted([(r['chamber'], r['d']) for r in eq if r['event_type'] == 'PM'], key=lambda t: t[1])
partdays = {(r['chamber'], r['d']): r['detail'] for r in eq if r['event_type'] == 'PART'}
pm_res = []
for ch, dt in pmrows:
    a = win(ch, dt - timedelta(days=14), dt)
    b = win(ch, dt + timedelta(days=1), dt + timedelta(days=14))
    delta = st.mean(b) - st.mean(a)
    pv = perm_p(a, b, 50000)
    tag = partdays.get((ch, dt), '없음')
    pm_res.append((ch, dt, delta, pv, tag != '없음'))
    p('  %-7s %-11s %6d %8.3f %6d %8.3f %+9.3f %10.5f %s' % (ch, dt.isoformat(), len(a), st.mean(a), len(b), st.mean(b), delta, pv, tag))
clean = [x[2] for x in pm_res if not x[4]]
p('')
p('  부품 교체가 겹치지 않은 PM %d 건의 변화: %s' % (len(clean), ['%+.3f' % v for v in clean]))
p('  그 중앙값 %+.3f%%p, 최솟값 %+.3f%%p — PM 자체로는 3%%p 급 하락이 한 번도 없다' % (st.median(clean), min(clean)))

p('')
p('=' * 78)
p('[D] 부품 교체 네 번 — 입고 검사 판정과 짝지어서')
p('  %-11s %-7s %-22s %-16s %-6s %9s %10s' % ('날짜','챔버','부품','성적서 serial','판정','변화(%p)','p(순열)'))
insp = {}
with open(os.path.join(BASE, 'data', 'part_incoming_inspection.csv'), encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if (r['install_date'] or '').strip():
            meas = float(r['measured'])
            conv = meas * 1000.0 if r['unit'] == 'mm' else meas
            v = 'NG' if conv > float(r['spec_max']) else 'OK'
            insp[(d(r['install_date']), r['chamber'])] = (r['serial'], v, conv, float(r['spec_max']), r['spec_item'])
part_res = []
for r in sorted([r for r in eq if r['event_type'] == 'PART'], key=lambda r: r['d']):
    ch, dt = r['chamber'], r['d']
    a = win(ch, dt - timedelta(days=14), dt)
    b = win(ch, dt + timedelta(days=1), dt + timedelta(days=14))
    delta = st.mean(b) - st.mean(a); pv = perm_p(a, b, 50000)
    s, v, conv, mx, item = insp.get((dt, ch), ('없음', '?', float('nan'), float('nan'), '?'))
    part_res.append((dt, ch, r['detail'], s, v, delta, pv))
    p('  %-11s %-7s %-22s %-16s %-6s %+9.3f %10.5f   (%s %.4g / max %.4g)'
      % (dt.isoformat(), ch, r['detail'], s, v, delta, pv, item, conv, mx))

p('')
p('=' * 78)
p('[E] 2×2 갈래: PM 여부 × 설치 부품 규격 초과 여부')
p('  %-24s %-7s %-9s %s' % ('사례', 'PM', '부품판정', '전후 변화(%p)'))
cells = []
for ch, dt, delta, pv, haspart in pm_res:
    key = (dt, ch)
    if key in insp:
        s, v, conv, mx, item = insp[key]
        cells.append(('%s %s' % (dt.isoformat(), ch), 'O', v, delta))
    else:
        cells.append(('%s %s' % (dt.isoformat(), ch), 'O', '교체없음', delta))
for dt, ch, detail, s, v, delta, pv in part_res:
    if not any(c[0] == '%s %s' % (dt.isoformat(), ch) for c in cells):
        cells.append(('%s %s' % (dt.isoformat(), ch), 'X', v, delta))
for nm, a, b, delta in sorted(cells):
    p('  %-24s %-7s %-9s %+.3f' % (nm, a, b, delta))
p('')
p('  요약:')
g = defaultdict(list)
for nm, a, b, delta in cells:
    g[(a, b)].append(delta)
for k in sorted(g):
    p('    PM=%s, 부품=%-9s → n=%d, 변화 %s' % (k[0], k[1], len(g[k]), ['%+.3f' % v for v in g[k]]))

p('')
p('=' * 78)
p('[F] CH-1A 대조: 07-15 에 규격 초과 히터코일(HC40-A-0771, 6.1pct/max 5.0)이 들어갔다')
E2 = date(2026, 7, 15)
a = win('CH-1A', E2 - timedelta(days=14), E2); b = win('CH-1A', E2 + timedelta(days=1), E2 + timedelta(days=14))
p('  수율   전 n=%d %.3f → 후 n=%d %.3f  변화 %+.3f%%p  p=%.5f'
  % (len(a), st.mean(a), len(b), st.mean(b), st.mean(b) - st.mean(a), perm_p(a, b, 50000)))
ap = win('CH-1A', E2 - timedelta(days=14), E2, 'pd'); bp = win('CH-1A', E2 + timedelta(days=1), E2 + timedelta(days=14), 'pd')
p('  파티클 전 %.1f → 후 %.1f 건/로트 (변화 %+.1f)' % (st.mean(ap), st.mean(bp), st.mean(bp) - st.mean(ap)))
p('  → 규격 초과 부품이라도 항목이 파티클과 무관하면(resistance_dev=발열 저항) 파티클이 늘지 않는다')

p('')
p('[G] 로트 수 점검 — 챔버·일자별 로트 수가 고른가 (하락이 표본 구성 탓은 아닌지)')
cnt = defaultdict(int)
for r in yl:
    cnt[(r['chamber'], r['d'])] += 1
vals = list(cnt.values())
p('  챔버·일자 조합 %d 개, 로트 수 분포: min %d, max %d, 중앙값 %d' % (len(cnt), min(vals), max(vals), st.median(vals)))
days = sorted({r['d'] for r in yl})
p('  수율 자료 일자 수 %d (%s ~ %s)' % (len(days), days[0], days[-1]))
gap = [(days[i-1], days[i]) for i in range(1, len(days)) if (days[i] - days[i-1]).days > 1]
p('  이틀 이상 빈 구간: %s' % (['%s→%s' % (a, b) for a, b in gap] or '없음'))
ch_per_day = defaultdict(set)
for r in yl:
    ch_per_day[r['d']].add(r['chamber'])
odd = {k: sorted(v) for k, v in ch_per_day.items() if len(v) != 6}
p('  여섯 챔버가 다 안 찍힌 날: %s' % (odd or '없음'))

with open(os.path.join(BASE, 'evidence', '02_event_effect.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')
