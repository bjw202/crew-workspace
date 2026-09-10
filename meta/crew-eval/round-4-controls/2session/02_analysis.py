# -*- coding: utf-8 -*-
"""02. 07-29 하락의 원인 가르기 — PM 쪽인가 샤워헤드 쪽인가."""
import pandas as pd, numpy as np, os

BASE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(BASE, "data")
out = []
def p(*a):
    s = " ".join(str(x) for x in a); print(s); out.append(s)

# ---------- 적재 · 정리 ----------
def fix_date(s):
    return pd.to_datetime(s.astype(str).str.replace("/", "-", regex=False), errors="coerce")

y = pd.read_csv(os.path.join(D, "yield_by_lot.csv"))
y["date"] = fix_date(y["date"])

eq = pd.read_csv(os.path.join(D, "equipment_history.csv"))
eq["date"] = fix_date(eq["date"])

ins = pd.read_csv(os.path.join(D, "part_incoming_inspection.csv"))
ins["recv_date"] = fix_date(ins["recv_date"])
ins["install_date"] = fix_date(ins["install_date"])
n0 = len(ins)
ins = ins.drop_duplicates()                      # 완전 중복 1행 제거
p(f"[0] incoming 중복 제거: {n0} -> {len(ins)} 행")

# 단위 통일: hole_dia_sd 는 um 기준. mm 로 적힌 값은 x1000.
def to_spec_unit(r):
    v = float(r["measured"])
    if r["spec_item"] == "hole_dia_sd" and str(r["unit"]).strip() == "mm":
        return v * 1000.0
    return v
ins["measured_norm"] = ins.apply(to_spec_unit, axis=1)
ins["spec_max"] = ins["spec_max"].astype(float)
ins["fail"] = ins["measured_norm"] > ins["spec_max"]
ins["margin_pct"] = (ins["measured_norm"] / ins["spec_max"] - 1) * 100

CUT = pd.Timestamp("2026-07-29")   # 하락이 나타난 날
PRE  = (pd.Timestamp("2026-07-01"), pd.Timestamp("2026-07-28"))
POST = (pd.Timestamp("2026-07-29"), pd.Timestamp("2026-08-25"))

# ---------- [1] 하락 재확인 ----------
p("\n" + "="*74)
p("[1] 07-29 전후 챔버별 수율 (앞선 결론 재확인)")
p(f"{'chamber':8s} {'pre_n':>5s} {'pre_mean':>9s} {'post_n':>6s} {'post_mean':>9s} {'delta_pp':>9s} "
  f"{'pre_ptcl':>9s} {'post_ptcl':>9s} {'d_ptcl':>7s}")
rows = []
for ch, g in y.groupby("chamber"):
    a = g[(g.date >= PRE[0]) & (g.date <= PRE[1])]
    b = g[(g.date >= POST[0]) & (g.date <= POST[1])]
    d = b.yield_pct.mean() - a.yield_pct.mean()
    dp = b.particle_defects.mean() - a.particle_defects.mean()
    rows.append(dict(chamber=ch, delta=d, dpart=dp))
    p(f"{ch:8s} {len(a):5d} {a.yield_pct.mean():9.3f} {len(b):6d} {b.yield_pct.mean():9.3f} "
      f"{d:+9.3f} {a.particle_defects.mean():9.2f} {b.particle_defects.mean():9.2f} {dp:+7.2f}")

# 비파티클 불량 = defect_count - particle_defects
p("\n  같은 구간, 파티클 불량 / 비파티클 불량 (로트당 평균 개수)")
for ch, g in y.groupby("chamber"):
    a = g[(g.date >= PRE[0]) & (g.date <= PRE[1])].copy()
    b = g[(g.date >= POST[0]) & (g.date <= POST[1])].copy()
    for t in (a, b): t["other"] = t.defect_count - t.particle_defects
    p(f"    {ch:8s} particle {a.particle_defects.mean():6.2f} -> {b.particle_defects.mean():6.2f} "
      f"({b.particle_defects.mean()-a.particle_defects.mean():+6.2f}) | "
      f"other {a['other'].mean():6.2f} -> {b['other'].mean():6.2f} ({b['other'].mean()-a['other'].mean():+6.2f})")

# ---------- [2] 입고 검사: 규격 이탈 목록 ----------
p("\n" + "="*74)
p("[2] 입고 검사 규격 이탈 (단위 통일 후, measured > spec_max)")
f = ins[ins.fail].sort_values("recv_date")
p(f"  전체 {len(ins)}행 중 이탈 {len(f)}행")
for _, r in f.iterrows():
    inst = "미장착" if pd.isna(r.install_date) else f"{r.install_date.date()} {r.chamber} 장착"
    p(f"    {r.recv_date.date()} {r.part_no:8s} {r.serial:15s} {str(r.supplier):11s} "
      f"{r.spec_item:14s} 규격<={r.spec_max:<5g} 측정={r.measured_norm:<7g} (초과 {r.margin_pct:+.0f}%) -> {inst}")

p("\n  장착된 부품 전체 (install_date 가 있는 행)")
for _, r in ins[ins.install_date.notna()].sort_values("install_date").iterrows():
    v = "이탈" if r.fail else "적합"
    p(f"    {r.install_date.date()} {r.chamber:6s} {r.part_no:8s} {r.serial:15s} {str(r.supplier):11s} "
      f"{r.spec_item:14s} {r.measured_norm:>7g}/{r.spec_max:<5g} {v}")

# ---------- [3] 대조: 같은 날 PM 받은 CH-3A / 같은 부품 간 CH-2B ----------
p("\n" + "="*74)
p("[3] 07-28 CH-3B 에 겹친 두 사건을 다른 챔버로 가른다")
def win(ch, lo, hi):
    g = y[(y.chamber == ch) & (y.date >= lo) & (y.date <= hi)]
    return g

def evt_effect(ch, evt_date, days=14, label=""):
    """사건 직전 days 일 vs 직후 days 일"""
    evt = pd.Timestamp(evt_date)
    a = win(ch, evt - pd.Timedelta(days=days), evt)             # 사건일 포함 이전
    b = win(ch, evt + pd.Timedelta(days=1), evt + pd.Timedelta(days=days))
    da = b.yield_pct.mean() - a.yield_pct.mean()
    dp = b.particle_defects.mean() - a.particle_defects.mean()
    p(f"    {label:34s} {ch:6s} {evt.date()}  수율 {a.yield_pct.mean():6.3f} -> {b.yield_pct.mean():6.3f} "
      f"({da:+6.3f}pp)  파티클 {a.particle_defects.mean():5.2f} -> {b.particle_defects.mean():5.2f} ({dp:+5.2f})  n={len(a)}/{len(b)}")
    return da, dp

p("  가름 A — PM(정기 정비)만 받은 사례 (비교 창 +-14일 안에 다른 PART/RECIPE 없음)")
evt_effect("CH-1B", "2026-07-14", label="PM 단독")
evt_effect("CH-2A", "2026-07-21", label="PM 단독")
evt_effect("CH-2B", "2026-07-21", label="PM 단독")
evt_effect("CH-3A", "2026-07-28", label="PM 단독")
p("  가름 A' — PM 인데 창 안에 부품 교체가 섞인 사례 (PM 단독으로 셀 수 없다)")
evt_effect("CH-1A", "2026-07-14", label="PM + HC-40(이탈품, 07-15)")
p("  가름 B — PM + 샤워헤드 교체가 겹친 사례")
evt_effect("CH-3B", "2026-07-28", label="PM + SH-2200(규격 이탈품)")
p("  가름 C — 샤워헤드 교체만 받은 사례 (PM 없음)")
evt_effect("CH-2B", "2026-08-06", label="SH-2200(적합품) 단독")
p("  참고 — 규격 이탈 히터 코일 장착 (파티클과 무관한 항목)")
evt_effect("CH-1A", "2026-07-15", label="HC-40(규격 이탈품) 장착")

# ---------- [4] 2x2 표 ----------
p("\n" + "="*74)
p("[4] 2x2: PM 유무 × 규격 이탈 샤워헤드 유무")
p("""
                    | 부품 교체 없음          | 적합 샤워헤드 장착      | 규격 이탈품 장착
    ----------------+-------------------------+-------------------------+---------------------------
    PM 있음         | CH-1B (07-14)           | (사례 없음)             | CH-3B (07-28, SH-2200)
                    | CH-2A (07-21)           |                         | CH-1A (07-14+15, HC-40)
                    | CH-2B (07-21)           |                         |   <- 품목이 다르다
                    | CH-3A (07-28)           |                         |
    PM 없음         | (평시)                  | CH-2B (08-06)           | (사례 없음)

    * CH-1A 는 07-14 PM 뒤 07-15 에 이탈 히터코일(HC40-A-0771, 6.1/5.0)을 장착했다.
      비교 창 +-14일 안에 들어오므로 'PM 단독' 으로 셀 수 없다.
""")

# ---------- [5] 통계 검정 ----------
p("\n" + "="*74)
p("[5] CH-3B 전후 차이의 통계 검정")
try:
    from scipy import stats
    have = True
except Exception:
    have = False
g = y[y.chamber == "CH-3B"]
a = g[(g.date >= PRE[0]) & (g.date <= PRE[1])].yield_pct.values
b = g[(g.date >= POST[0]) & (g.date <= POST[1])].yield_pct.values
p(f"  pre  n={len(a)} mean={a.mean():.3f} sd={a.std(ddof=1):.3f}")
p(f"  post n={len(b)} mean={b.mean():.3f} sd={b.std(ddof=1):.3f}")
p(f"  차이 = {b.mean()-a.mean():+.3f} pp")
if have:
    t, pv = stats.ttest_ind(a, b, equal_var=False)
    u, pu = stats.mannwhitneyu(a, b)
    p(f"  Welch t-test  t={t:.3f}  p={pv:.3e}")
    p(f"  Mann-Whitney  U={u:.1f}  p={pu:.3e}")
else:
    # scipy 없으면 부트스트랩
    rng = np.random.default_rng(0)
    pool = np.concatenate([a, b]); obs = abs(b.mean() - a.mean()); cnt = 0
    for _ in range(20000):
        rng.shuffle(pool)
        if abs(pool[len(a):].mean() - pool[:len(a)].mean()) >= obs: cnt += 1
    if cnt == 0:
        p(f"  순열검정: 20000회 중 관측만큼 큰 차이가 난 경우 0회 -> p < {1/20000:.0e} (이 검정의 하한. 측정값이 아니다)")
    else:
        p(f"  순열검정: 20000회 중 {cnt}회 -> p = {cnt/20000:.2e}")

# ---------- [6] 08-10 특별 세정 이후 회복 여부 ----------
p("\n" + "="*74)
p("[6] 08-10 CH-3B 특별 세정(파티클 대응, 180분) 이후 회복했나")
for lo, hi, lab in [("2026-07-01","2026-07-28","07-28 이전"),
                    ("2026-07-29","2026-08-10","07-29 ~ 08-10"),
                    ("2026-08-11","2026-08-25","08-11 ~ 08-25 (세정 후)")]:
    g2 = win("CH-3B", pd.Timestamp(lo), pd.Timestamp(hi))
    p(f"  {lab:24s} n={len(g2):3d} 수율={g2.yield_pct.mean():6.3f}  파티클={g2.particle_defects.mean():5.2f}")

# ---------- [7] 일자별 CH-3B 추이 ----------
p("\n" + "="*74)
p("[7] CH-3B 일자별 (07-24 ~ 08-05)")
g3 = y[(y.chamber=="CH-3B")].groupby("date").agg(
    yield_mean=("yield_pct","mean"), particle=("particle_defects","mean"), other=("defect_count","mean"))
g3["other"] = g3["other"] - g3["particle"]
p(g3.loc["2026-07-24":"2026-08-05"].round(2).to_string())

# ---------- [8] 공급사별 이탈률 ----------
p("\n" + "="*74)
p("[8] 공급사별 입고 검사 이탈률 (참고 — 표본이 작다)")
s = ins.copy(); s["supplier"] = s.supplier.fillna("(미기재)")
t = s.groupby("supplier").agg(n=("fail","size"), fail=("fail","sum"))
t["fail_rate_pct"] = (t.fail / t.n * 100).round(1)
p(t.to_string())
p("\n  SH-2200 만: 공급사별")
sh = s[s.part_no=="SH-2200"]
p(sh[["recv_date","serial","supplier","measured","unit","measured_norm","spec_max","fail","install_date","chamber"]].to_string())

with open(os.path.join(BASE, "out", "02_analysis.txt"), "w") as fo:
    fo.write("\n".join(out) + "\n")
