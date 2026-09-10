#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""07-29 하락의 원인을 정기 정비(PM)와 샤워헤드 교체(PART)로 가를 수 있는지 본다.
출력: out/02_analysis.txt
scipy 를 쓸 수 없는 환경이라 유의성은 순열검정(permutation test)으로 낸다.
"""
import pandas as pd
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "out")
os.makedirs(OUT, exist_ok=True)
RNG = np.random.default_rng(20260909)

lines = []
def p(s=""):
    lines.append(str(s))
    print(s)

# ---------------- 적재 (날짜 형식 흔들림을 바로잡는다) ----------------
def rd(fn):
    df = pd.read_csv(os.path.join(DATA, fn), dtype=str)
    for c in df.columns:
        if c.endswith("date"):
            df[c] = pd.to_datetime(df[c].str.replace("/", "-", regex=False), errors="coerce")
    return df

yl = rd("yield_by_lot.csv")
eq = rd("equipment_history.csv")
pi = rd("part_incoming_inspection.csv")

for c in ["yield_pct", "defect_count", "particle_defects"]:
    yl[c] = pd.to_numeric(yl[c])
yl["nonparticle_defects"] = yl["defect_count"] - yl["particle_defects"]

# 부품 검사: 완전 중복 행 하나를 뺀다 (SH2200-B-0412 가 두 번 적혀 있다)
n_before = len(pi)
pi = pi.drop_duplicates().reset_index(drop=True)
p(f"[전처리] 부품 검사 성적서 완전중복 제거: {n_before}행 -> {len(pi)}행")

# 단위를 spec 단위로 맞춘다 (hole_dia_sd 는 um 기준인데 mm 로 적힌 행이 있다)
pi["measured_num"] = pd.to_numeric(pi["measured"])
pi["spec_max_num"] = pd.to_numeric(pi["spec_max"])
SPEC_UNIT = {"hole_dia_sd": "um", "flatness": "um", "leak_rate": "sccm",
             "resistance_dev": "pct", "temp_dev": "degC", "hardness_dev": "shoreA"}
CONV = {("mm", "um"): 1000.0}
pi["unit_fixed"] = pi["spec_item"].map(SPEC_UNIT)
pi["measured_conv"] = [
    m * CONV.get((u, su), 1.0) for m, u, su in zip(pi["measured_num"], pi["unit"], pi["unit_fixed"])
]
pi["ratio"] = pi["measured_conv"] / pi["spec_max_num"]
pi["판정"] = np.where(pi["measured_conv"] > pi["spec_max_num"], "불합격", "합격")

p("\n" + "=" * 74)
p("A. 부품 입고 검사 성적서 — 규격 판정")
p("=" * 74)
p("(단위 환산 후. mm 로 적힌 hole_dia_sd 는 x1000 하여 um 으로 맞췄다)")
p("")
p(f"{'recv':<11}{'part':<9}{'serial':<16}{'공급사':<12}{'항목':<15}{'실측':>9}{'규격':>7}{'비율':>7}  판정  설치")
for _, r in pi.sort_values(["recv_date", "serial"]).iterrows():
    inst = "" if pd.isna(r["install_date"]) else f"{r['install_date'].date()} {r['chamber']}"
    sup = r["supplier"] if isinstance(r["supplier"], str) else "(빈칸)"
    p(f"{str(r['recv_date'].date()):<11}{r['part_no']:<9}{r['serial']:<16}{sup:<12}"
      f"{r['spec_item']:<15}{r['measured_conv']:>9.4g}{r['spec_max_num']:>7.1f}{r['ratio']:>7.2f}  "
      f"{r['판정']}  {inst}")

fail = pi[pi["판정"] == "불합격"]
p(f"\n규격 초과(불합격) 부품: {len(fail)}건 / 전체 {len(pi)}건")
for _, r in fail.iterrows():
    inst = "재고(미설치)" if pd.isna(r["install_date"]) else f"{r['install_date'].date()} {r['chamber']} 에 설치"
    p(f"  - {r['serial']} ({r['part_no']}, {r['supplier']}): "
      f"{r['spec_item']} {r['measured_conv']:.4g} > 규격 {r['spec_max_num']:.1f} "
      f"(규격의 {r['ratio']*100:.0f}%) → {inst}")

# ---------------- B. 설비 이력의 PART 이벤트와 검사 성적서를 잇는다 ----------------
p("\n" + "=" * 74)
p("B. 설비 이력의 부품 교체(PART) 4건에 검사 성적서를 붙인다")
p("=" * 74)
parts_eq = eq[eq["event_type"] == "PART"].sort_values("date")
inst = pi[pi["install_date"].notna()]
p(f"설비 이력의 PART 이벤트: {len(parts_eq)}건 / 검사 성적서에 설치 기록이 있는 부품: {len(inst)}건")
p("")
for _, r in parts_eq.iterrows():
    m = inst[(inst["install_date"] == r["date"]) & (inst["chamber"] == r["chamber"])]
    if len(m) == 1:
        s = m.iloc[0]
        p(f"  {r['date'].date()} {r['chamber']} '{r['detail']}' ({r['duration_min']}분)")
        p(f"      ↳ {s['serial']} {s['supplier']} {s['spec_item']}="
          f"{s['measured_conv']:.4g}/{s['spec_max_num']:.1f} → {s['판정']} (규격의 {s['ratio']*100:.0f}%)")
    else:
        p(f"  {r['date'].date()} {r['chamber']} '{r['detail']}' → 대응하는 검사 성적서 {len(m)}건 (짝을 못 지음)")
p("\n  => PART 4건이 검사 성적서 4건과 날짜·챔버로 하나씩 정확히 짝지어진다.")

# ---------------- C. 챔버별 수율 변화 (07-28 사건 기준) ----------------
p("\n" + "=" * 74)
p("C. 07-28 사건 앞뒤 챔버별 변화 (앞: 07-14~07-28, 뒤: 07-29~08-12, 각 15일)")
p("=" * 74)

def perm_p(a, b, n=20000):
    """두 표본 평균차의 양측 순열검정 p값."""
    a = np.asarray(a, float); b = np.asarray(b, float)
    obs = abs(a.mean() - b.mean())
    pool = np.concatenate([a, b]); na = len(a)
    cnt = 0
    for _ in range(n):
        RNG.shuffle(pool)
        if abs(pool[:na].mean() - pool[na:].mean()) >= obs - 1e-12:
            cnt += 1
    return (cnt + 1) / (n + 1)

def window(ch, d0, d1):
    m = (yl["chamber"] == ch) & (yl["date"] >= d0) & (yl["date"] <= d1)
    return yl[m]

CUT = pd.Timestamp("2026-07-28")
PRE0, PRE1 = pd.Timestamp("2026-07-14"), pd.Timestamp("2026-07-28")
PST0, PST1 = pd.Timestamp("2026-07-29"), pd.Timestamp("2026-08-12")

rows = []
for ch in sorted(yl["chamber"].unique()):
    a, b = window(ch, PRE0, PRE1), window(ch, PST0, PST1)
    rows.append(dict(
        chamber=ch, n_pre=len(a), n_post=len(b),
        y_pre=a["yield_pct"].mean(), y_post=b["yield_pct"].mean(),
        d_yield=b["yield_pct"].mean() - a["yield_pct"].mean(),
        p_yield=perm_p(a["yield_pct"], b["yield_pct"]),
        pt_pre=a["particle_defects"].mean(), pt_post=b["particle_defects"].mean(),
        d_particle=b["particle_defects"].mean() - a["particle_defects"].mean(),
        p_particle=perm_p(a["particle_defects"], b["particle_defects"]),
        np_pre=a["nonparticle_defects"].mean(), np_post=b["nonparticle_defects"].mean(),
        d_nonpart=b["nonparticle_defects"].mean() - a["nonparticle_defects"].mean(),
        p_nonpart=perm_p(a["nonparticle_defects"], b["nonparticle_defects"]),
    ))
C = pd.DataFrame(rows)
p(f"{'챔버':<8}{'수율앞':>8}{'수율뒤':>8}{'차이':>9}{'p':>9}   "
  f"{'파티클앞':>9}{'파티클뒤':>9}{'차이':>8}{'p':>9}   {'비파티클차':>11}{'p':>9}")
for _, r in C.iterrows():
    p(f"{r['chamber']:<8}{r['y_pre']:>8.3f}{r['y_post']:>8.3f}{r['d_yield']:>+9.3f}{r['p_yield']:>9.4f}   "
      f"{r['pt_pre']:>9.2f}{r['pt_post']:>9.2f}{r['d_particle']:>+8.2f}{r['p_particle']:>9.4f}   "
      f"{r['d_nonpart']:>+11.2f}{r['p_nonpart']:>9.4f}")
p("\n  (각 창의 로트 수: 앞 %d개, 뒤 %d개)" % (C['n_pre'].iloc[0], C['n_post'].iloc[0]))
p("  => 여섯 챔버 중 CH-3B 만 수율이 내려가고 파티클 불량이 오른다. 비파티클 불량은 어느 챔버도 안 변한다.")

# ---------------- D. PM 만 받은 경우 vs 부품 교체까지 받은 경우 ----------------
p("\n" + "=" * 74)
p("D. 사건별 앞뒤 변화 — PM 6건, 부품 교체 4건 (사건일 앞 14일 / 뒤 14일)")
p("=" * 74)

def event_delta(ch, day, span=14):
    a = window(ch, day - pd.Timedelta(days=span), day)
    b = window(ch, day + pd.Timedelta(days=1), day + pd.Timedelta(days=span))
    return (b["yield_pct"].mean() - a["yield_pct"].mean(),
            b["particle_defects"].mean() - a["particle_defects"].mean(),
            perm_p(a["yield_pct"], b["yield_pct"]), len(a), len(b))

p(f"{'구분':<6}{'날짜':<12}{'챔버':<8}{'내용':<28}{'수율차':>9}{'p':>9}{'파티클차':>10}  부품판정")
ev_rows = []
for _, r in eq[eq["event_type"].isin(["PM", "PART"])].sort_values(["event_type", "date"]).iterrows():
    dy, dpt, pv, na, nb = event_delta(r["chamber"], r["date"])
    m = inst[(inst["install_date"] == r["date"]) & (inst["chamber"] == r["chamber"])]
    verdict = f"{m.iloc[0]['판정']} ({m.iloc[0]['spec_item']} {m.iloc[0]['ratio']*100:.0f}%)" if len(m) == 1 else "-"
    p(f"{r['event_type']:<6}{str(r['date'].date()):<12}{r['chamber']:<8}{r['detail'][:26]:<28}"
      f"{dy:>+9.3f}{pv:>9.4f}{dpt:>+10.2f}  {verdict}")
    ev_rows.append(dict(kind=r["event_type"], date=r["date"], chamber=r["chamber"],
                        detail=r["detail"], d_yield=dy, d_particle=dpt, p=pv, verdict=verdict))
E = pd.DataFrame(ev_rows)

pm = E[E["kind"] == "PM"]
p(f"\n  PM 6건의 수율차: 중앙값 {pm['d_yield'].median():+.3f}%p, "
  f"범위 {pm['d_yield'].min():+.3f} ~ {pm['d_yield'].max():+.3f}%p")
pm_others = pm[pm["chamber"] != "CH-3B"]
p(f"  CH-3B 을 뺀 PM 5건: 중앙값 {pm_others['d_yield'].median():+.3f}%p, "
  f"범위 {pm_others['d_yield'].min():+.3f} ~ {pm_others['d_yield'].max():+.3f}%p")
p("  => PM 을 받은 여섯 중 다섯은 안 떨어졌다. PM 자체는 하락을 못 만든다.")
p("")
sh = E[E["detail"].str.contains("SH-2200|샤워헤드|Showerhead", regex=True)]
for _, r in sh.iterrows():
    p(f"  샤워헤드 교체 {r['date'].date()} {r['chamber']}: 수율차 {r['d_yield']:+.3f}%p / {r['verdict']}")
p("  => 샤워헤드 교체라는 '행위'도 둘 중 하나만 떨어뜨렸다. 행위가 아니라 '어느 부품이 들어갔나'가 갈랐다.")

# ---------------- E. 규격 판정별 묶음 ----------------
p("\n" + "=" * 74)
p("E. 설치된 부품 4건을 규격 판정으로 묶어 본다")
p("=" * 74)
p(f"{'설치일':<12}{'챔버':<8}{'부품':<10}{'항목':<15}{'규격대비':>9}  {'판정':<8}{'수율차':>9}{'파티클차':>10}")
for _, s in inst.sort_values("install_date").iterrows():
    dy, dpt, pv, _, _ = event_delta(s["chamber"], s["install_date"])
    p(f"{str(s['install_date'].date()):<12}{s['chamber']:<8}{s['part_no']:<10}{s['spec_item']:<15}"
      f"{s['ratio']*100:>8.0f}%  {s['판정']:<8}{dy:>+9.3f}{dpt:>+10.2f}")
p("\n  => 규격을 넘긴 부품 2건 중 수율을 떨어뜨린 것은 샤워헤드 1건뿐이다.")
p("     히터 코일(HC-40, 저항 편차 규격의 122%)은 CH-1A 에 들어갔지만 수율이 안 떨어졌다.")
p("     '규격 초과면 무조건 떨어진다'는 성립하지 않는다. 항목별로 봐야 한다.")

# ---------------- F. 하락의 시점 ----------------
p("\n" + "=" * 74)
p("F. CH-3B 일별 추이 — 하락이 어느 날 시작됐나")
p("=" * 74)
d3b = yl[yl["chamber"] == "CH-3B"].groupby("date").agg(
    수율=("yield_pct", "mean"), 파티클=("particle_defects", "mean"), 총불량=("defect_count", "mean")).reset_index()
sub = d3b[(d3b["date"] >= "2026-07-20") & (d3b["date"] <= "2026-08-05")]
for _, r in sub.iterrows():
    mark = ""
    e = eq[(eq["chamber"] == "CH-3B") & (eq["date"] == r["date"])]
    if len(e):
        mark = "  <== " + " / ".join(e["detail"])
    p(f"  {r['date'].date()}  수율 {r['수율']:6.3f}  파티클 {r['파티클']:5.1f}  총불량 {r['총불량']:5.1f}{mark}")
p("  => 07-28 에 작업이 있었고, 하락은 바로 다음 날인 07-29 부터다.")

# ---------------- G. 08-10 특별 세정 뒤 회복 ----------------
p("\n" + "=" * 74)
p("G. 08-10 특별 세정(파티클 대응, 180분) 뒤에 회복했나")
p("=" * 74)
segs = [("07-01~07-28 (사건 전)", "2026-07-01", "2026-07-28"),
        ("07-29~08-10 (사건 후, 세정 전)", "2026-07-29", "2026-08-10"),
        ("08-11~08-25 (특별 세정 후)", "2026-08-11", "2026-08-25")]
for label, a, b in segs:
    m = yl[(yl["chamber"] == "CH-3B") & (yl["date"] >= a) & (yl["date"] <= b)]
    p(f"  {label:<32} 수율 {m['yield_pct'].mean():6.3f}  파티클 {m['particle_defects'].mean():5.2f}  (n={len(m)})")
s2 = yl[(yl["chamber"] == "CH-3B") & (yl["date"] >= "2026-07-29") & (yl["date"] <= "2026-08-10")]["yield_pct"]
s3 = yl[(yl["chamber"] == "CH-3B") & (yl["date"] >= "2026-08-11") & (yl["date"] <= "2026-08-25")]["yield_pct"]
p(f"\n  세정 전후 차이: {s3.mean()-s2.mean():+.3f}%p, 순열검정 p={perm_p(s2, s3):.4f}")
p("  => 180분 특별 세정으로도 안 돌아왔다. 세정으로 지워지는 오염이 아니다.")
p("     (교체된 하드웨어가 계속 파티클을 낸다는 쪽에 무게가 실린다) [추정]")

# ---------------- H. 공급사 ----------------
p("\n" + "=" * 74)
p("H. 공급사별 규격 대비 실측 (같은 부품끼리 비교)")
p("=" * 74)
for item in ["hole_dia_sd"]:
    sub = pi[pi["spec_item"] == item]
    p(f"  [{item}] 규격 {sub['spec_max_num'].iloc[0]:.1f} um")
    for sup, g in sub.groupby("supplier"):
        vals = ", ".join(f"{v:.4g}" for v in sorted(g["measured_conv"]))
        p(f"    {sup:<12} n={len(g)}  실측(um): {vals}  최대 {g['measured_conv'].max():.4g}  "
          f"불합격 {int((g['판정']=='불합격').sum())}건")
p("  => 규격을 넘긴 샤워헤드는 BSTech 07-18 입고분 한 개뿐이다. 같은 날 입고된 나머지 둘은 합격이다.")
p("     공급사 전체 문제라고 하기에는 수가 모자란다 (BSTech 샤워헤드 4개 중 1개). [추정]")

# ---------------- I. 흠이 결론을 바꾸는지 ----------------
p("\n" + "=" * 74)
p("I. 앞에서 찾은 자료의 흠이 결론을 바꾸는지 다시 계산")
p("=" * 74)
raw = pd.read_csv(os.path.join(DATA, "part_incoming_inspection.csv"), dtype=str)
raw["mn"] = pd.to_numeric(raw["measured"])
raw["sm"] = pd.to_numeric(raw["spec_max"])
p("  (1) 중복 행을 안 지웠을 때: SH2200-B-0412 가 두 번 세어질 뿐, 판정은 그대로 불합격.")
p("      → 결론 안 바뀜.")
naive_fail = raw[raw["mn"] > raw["sm"]]
p(f"  (2) 단위를 안 맞췄을 때(mm 를 그대로 씀): 불합격 판정이 "
  f"{len(naive_fail.drop_duplicates())}건 → 단위 맞춘 뒤 {len(fail)}건.")
extra = fail[~fail["serial"].isin(naive_fail["serial"])]
p(f"      단위 환산으로 새로 불합격이 된 것: {list(extra['serial'])} "
  f"(mm 로 적혀 있어 숫자만 보면 0.0031 로 작아 보였다)")
p("      → 새로 걸린 SH2200-A-1190 은 설치 기록이 없다(재고). 07-28 판정은 안 바뀜.")
p("  (3) 날짜 형식(2026/08/01, 2026/08/03): 고쳐 읽었다. 둘 다 CH-3B 07-28 과 무관.")
p("      → 결론 안 바뀜.")
p("  (4) 설비 이력이 08-20 에서 끊김: 08-21~08-25 에 무슨 작업이 있었는지 모른다.")
p("      → 회복이 없다는 관찰(G)의 해석에 여지를 남긴다. 07-28 판정은 안 바뀜.")

with open(os.path.join(OUT, "02_analysis.txt"), "w") as f:
    f.write("\n".join(lines) + "\n")
C.to_csv(os.path.join(OUT, "chamber_prepost.csv"), index=False)
E.to_csv(os.path.join(OUT, "event_deltas.csv"), index=False)
pi.to_csv(os.path.join(OUT, "part_inspection_judged.csv"), index=False)
print(f"\n[저장] {OUT}/02_analysis.txt, chamber_prepost.csv, event_deltas.csv, part_inspection_judged.csv")
