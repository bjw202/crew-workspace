#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CH-3B 2026-07-29 수율 하락: 정기정비(PM) 대 샤워헤드(SH-2200) 교체 가르기.
부품 입고 검사 성적서를 보태서 판정한다.

의존성: pandas 만. (이 환경의 scipy 는 아키텍처 불일치로 깨져 있어 순열검정을 직접 구현한다.)
출력: evidence.txt
"""
import sys, io, random
import pandas as pd

random.seed(20260909)
OUT = io.StringIO()


def p(*a):
    s = " ".join(str(x) for x in a)
    print(s)
    OUT.write(s + "\n")


def head(t):
    p("")
    p("=" * 78)
    p(t)
    p("=" * 78)


def norm_date(s):
    """2026/08/01 같은 표기를 2026-08-01 로 맞춘다."""
    return pd.to_datetime(pd.Series(s).astype(str).str.replace("/", "-", regex=False),
                          format="%Y-%m-%d", errors="coerce")


def perm_test(a, b, n=20000):
    """평균차 양측 순열검정. a, b 는 list of float."""
    a, b = list(a), list(b)
    if len(a) < 2 or len(b) < 2:
        return float("nan"), float("nan")
    obs = sum(b) / len(b) - sum(a) / len(a)
    pool = a + b
    na = len(a)
    cnt = 0
    for _ in range(n):
        random.shuffle(pool)
        d = sum(pool[na:]) / (len(pool) - na) - sum(pool[:na]) / na
        if abs(d) >= abs(obs) - 1e-12:
            cnt += 1
    return obs, (cnt + 1) / (n + 1)


# ---------------------------------------------------------------- 자료 적재
y = pd.read_csv("data/yield_by_lot.csv")
e = pd.read_csv("data/equipment_history.csv")
q = pd.read_csv("data/part_incoming_inspection.csv")

y["d"] = norm_date(y["date"])
e["d"] = norm_date(e["date"])
q["recv_d"] = norm_date(q["recv_date"])
q["inst_d"] = norm_date(q["install_date"])

head("0. 자료 흠 점검")
p(f"수율 로트 {len(y)}행 / 설비 이력 {len(e)}건 / 입고 검사 {len(q)}행")

p("")
p("[흠 1] 날짜 표기가 섞여 있다 (YYYY/MM/DD 가 YYYY-MM-DD 사이에 끼어 있다):")
for nm, df, col in (("equipment_history", e, "date"), ("part_incoming_inspection", q, "recv_date")):
    bad = df[df[col].astype(str).str.contains("/")]
    for _, r in bad.iterrows():
        p(f"    {nm}: {r[col]}  ({r.get('chamber', '')} {r.get('part_no', r.get('detail', ''))})")
p("    → 파싱 시 '-' 로 맞춰 처리했다. 결측으로 떨어진 날짜는 아래에 센다.")
p(f"    파싱 실패 건수: yield={y['d'].isna().sum()}, equip={e['d'].isna().sum()}, "
  f"incoming(recv)={q['recv_d'].isna().sum()}")

p("")
p("[흠 2] 입고 검사 중복 행:")
dup = q[q.duplicated(subset=["recv_date", "part_no", "serial", "measured"], keep=False)]
for _, r in dup.iterrows():
    p(f"    {r['recv_date']} {r['part_no']} {r['serial']} measured={r['measured']}{r['unit']} "
      f"install={r['install_date']} {r['chamber']}")
p(f"    → 같은 시리얼·같은 측정값이 {len(dup)}행. 실물은 1개다. 아래 계산에서 1건으로 접는다.")

p("")
p("[흠 3] 단위가 섞여 있다 (hole_dia_sd 의 spec_max 는 3.0 um 인데 mm 로 적힌 행이 있다):")
sh = q[q["part_no"] == "SH-2200"]
for _, r in sh.iterrows():
    flag = "  ← mm 표기" if r["unit"] == "mm" else ""
    p(f"    {r['serial']}  measured={r['measured']} {r['unit']}{flag}")
p("    → mm→um 환산(x1000)하면 0.0023mm=2.3um, 0.0031mm=3.1um.")
p("       환산 전에는 둘 다 스펙(3.0) 이하로 보이지만, 환산하면 0.0031mm=3.1um 는 스펙 초과다.")

p("")
p("[흠 4] 공급사 결측:")
for _, r in q[q["supplier"].isna()].iterrows():
    p(f"    {r['recv_date']} {r['part_no']} {r['serial']} supplier=(빈칸)")

p("")
p("[흠 5] 설비 이력의 표기 흔들림:")
for _, r in e[e["event_type"] == "PART"].iterrows():
    p(f"    {r['date']} {r['chamber']}  '{r['detail']}'")
p("    → 같은 SH-2200 교체가 한 번은 한글, 한 번은 영문으로 적혔다. 문자열 검색으로만 세면 놓친다.")
miss_worker = e[e["worker"].isna()]
for _, r in miss_worker.iterrows():
    p(f"    작업자 결측: {r['date']} {r['chamber']} {r['event_type']} {r['detail']}")

# 입고검사 ↔ 설비이력 대사
p("")
p("[대사] 설비 이력의 PART 교체와 입고 검사의 install_date 가 맞는가:")
parts_ev = e[e["event_type"] == "PART"][["d", "chamber", "detail"]]
inst = q.dropna(subset=["inst_d"]).drop_duplicates(subset=["serial", "inst_d"])
for _, r in parts_ev.iterrows():
    m = inst[(inst["inst_d"] == r["d"]) & (inst["chamber"] == r["chamber"])]
    got = ", ".join(f"{x['part_no']}/{x['serial']}" for _, x in m.iterrows()) or "없음"
    p(f"    {r['d'].date()} {r['chamber']} {r['detail'][:28]:<30} → 검사성적서 매칭: {got}")
p(f"    설비이력 PART 건수={len(parts_ev)}, 성적서에 장착기록 있는 부품(중복제거)={len(inst)}")

# ---------------------------------------------------------- 1. 하락 재확인
head("1. 07-29 하락 재확인 (07-29 를 경계로 전후 비교)")
CUT = pd.Timestamp("2026-07-29")
p(f"{'챔버':<8}{'전 평균':>9}{'후 평균':>9}{'차이(%p)':>11}{'p(순열)':>10}{'전 로트':>8}{'후 로트':>8}")
for ch in sorted(y["chamber"].unique()):
    s = y[y["chamber"] == ch]
    a = s[s["d"] < CUT]["yield_pct"].tolist()
    b = s[s["d"] >= CUT]["yield_pct"].tolist()
    d, pv = perm_test(a, b)
    p(f"{ch:<8}{sum(a)/len(a):>9.3f}{sum(b)/len(b):>9.3f}{d:>11.3f}{pv:>10.4f}{len(a):>8}{len(b):>8}")

p("")
p("파티클 불량 비중 (particle_defects / defect_count 합계 기준):")
p(f"{'챔버':<8}{'전':>8}{'후':>8}{'변화':>8}")
for ch in sorted(y["chamber"].unique()):
    s = y[y["chamber"] == ch]
    a = s[s["d"] < CUT]
    b = s[s["d"] >= CUT]
    ra = a["particle_defects"].sum() / a["defect_count"].sum()
    rb = b["particle_defects"].sum() / b["defect_count"].sum()
    p(f"{ch:<8}{ra:>8.3f}{rb:>8.3f}{rb-ra:>8.3f}")

p("")
p("CH-3B 의 늘어난 불량이 전부 파티클인가 (로트당 평균 개수):")
s = y[y["chamber"] == "CH-3B"]
a, b = s[s["d"] < CUT], s[s["d"] >= CUT]
for col in ("defect_count", "particle_defects"):
    p(f"    {col:<18} 전 {a[col].mean():.2f} → 후 {b[col].mean():.2f}  (증가 {b[col].mean()-a[col].mean():+.2f})")
p(f"    파티클 아닌 불량      전 {(a['defect_count']-a['particle_defects']).mean():.2f} "
  f"→ 후 {(b['defect_count']-b['particle_defects']).mean():.2f}  "
  f"(증가 {(b['defect_count']-b['particle_defects']).mean()-(a['defect_count']-a['particle_defects']).mean():+.2f})")

# ---------------------------------------------- 2. 사건별 전후 (공통 창)
head("2. 사건별 전후 비교 (사건일 제외, 앞 10일 / 뒤 10일)")


def window(ch, day, w=10):
    s = y[y["chamber"] == ch]
    a = s[(s["d"] >= day - pd.Timedelta(days=w)) & (s["d"] < day)]["yield_pct"].tolist()
    b = s[(s["d"] > day) & (s["d"] <= day + pd.Timedelta(days=w))]["yield_pct"].tolist()
    return a, b


p(f"{'사건':<26}{'날짜':<12}{'챔버':<8}{'전':>8}{'후':>8}{'차이(%p)':>11}{'p':>9}")
events = []
for _, r in e[e["event_type"].isin(["PM", "PART"])].sort_values("d").iterrows():
    events.append((r["detail"], r["d"], r["chamber"], r["event_type"]))
for det, day, ch, et in events:
    a, b = window(ch, day)
    d, pv = perm_test(a, b)
    p(f"{det[:24]:<26}{str(day.date()):<12}{ch:<8}{sum(a)/len(a):>8.3f}{sum(b)/len(b):>8.3f}{d:>11.3f}{pv:>9.4f}")

p("")
p("→ PM(정기 정비)은 6챔버가 모두 받았다. 그중 떨어진 곳은 CH-3B 하나다.")
p("→ SH-2200 교체는 2건이다. CH-3B(07-28)는 떨어지고 CH-2B(08-06)는 안 떨어졌다.")

# ------------------------------------------------- 3. 입고 검사 스펙 대조
head("3. 입고 검사 스펙 대조 (단위 환산 뒤)")


def to_spec_unit(row):
    v, u, it = float(row["measured"]), row["unit"], row["spec_item"]
    if it == "hole_dia_sd" and u == "mm":
        return v * 1000.0, "um(환산)"
    return v, u


q2 = q.drop_duplicates(subset=["recv_date", "part_no", "serial", "measured"]).copy()
q2[["m_norm", "u_norm"]] = q2.apply(lambda r: pd.Series(to_spec_unit(r)), axis=1)
q2["over"] = q2["m_norm"] > q2["spec_max"]
p(f"중복 제거 후 {len(q2)}행. 스펙 초과 {int(q2['over'].sum())}건:")
p(f"{'입고일':<12}{'부품':<9}{'시리얼':<16}{'공급사':<12}{'항목':<15}{'스펙':>7}{'측정':>9}{'배수':>7}  장착")
for _, r in q2[q2["over"]].sort_values("recv_d").iterrows():
    inst = f"{r['install_date']} {r['chamber']}" if pd.notna(r["inst_d"]) else "미장착(재고)"
    p(f"{str(r['recv_d'].date()):<12}{r['part_no']:<9}{r['serial']:<16}{str(r['supplier']):<12}"
      f"{r['spec_item']:<15}{r['spec_max']:>7.1f}{r['m_norm']:>9.3f}{r['m_norm']/r['spec_max']:>7.2f}  {inst}")

p("")
p("장착된 부품 전부 (설비 이력 PART 4건에 대응):")
p(f"{'장착일':<12}{'챔버':<8}{'부품':<9}{'시리얼':<16}{'항목':<15}{'스펙':>7}{'측정':>9}  판정")
for _, r in q2.dropna(subset=["inst_d"]).sort_values("inst_d").iterrows():
    p(f"{str(r['inst_d'].date()):<12}{r['chamber']:<8}{r['part_no']:<9}{r['serial']:<16}"
      f"{r['spec_item']:<15}{r['spec_max']:>7.1f}{r['m_norm']:>9.3f}  {'초과' if r['over'] else '합격'}")

p("")
p("SH-2200 만 모아 보기 (hole_dia_sd, 스펙 3.0 um 이하):")
for _, r in q2[q2["part_no"] == "SH-2200"].sort_values("recv_d").iterrows():
    inst = f"→ {r['install_date']} {r['chamber']}" if pd.notna(r["inst_d"]) else ""
    p(f"    {str(r['recv_d'].date())} {r['serial']:<16}{str(r['supplier']):<12}"
      f"{r['m_norm']:>7.3f} um  {'초과' if r['over'] else '합격'}  {inst}")

p("")
p("공급사별 스펙 초과율(중복 제거, 결측 제외):")
g = q2.dropna(subset=["supplier"]).groupby("supplier")["over"].agg(["sum", "count"])
for sup, r in g.iterrows():
    p(f"    {sup:<12} {int(r['sum'])}/{int(r['count'])} = {r['sum']/r['count']:.2%}")
p("")
p("SH-2200 만 공급사별:")
g2 = q2[q2["part_no"] == "SH-2200"].groupby("supplier")["over"].agg(["sum", "count"])
for sup, r in g2.iterrows():
    p(f"    {sup:<12} {int(r['sum'])}/{int(r['count'])} = {r['sum']/r['count']:.2%}")

# ------------------------------------------- 4. 반증 검토: 스펙 초과 = 하락?
head("4. 반증 검토 — '스펙 초과 부품을 달면 떨어진다' 가 늘 맞나")
a, b = window("CH-1A", pd.Timestamp("2026-07-15"))
d, pv = perm_test(a, b)
p(f"CH-1A 는 07-15 에 스펙 초과 히터코일(HC40-A-0771, resistance_dev 6.1 > 5.0)을 달았다.")
p(f"    전 {sum(a)/len(a):.3f} → 후 {sum(b)/len(b):.3f}  차이 {d:+.3f}%p  p={pv:.4f}")
s = y[y["chamber"] == "CH-1A"]
aa = s[(s["d"] >= pd.Timestamp("2026-07-05")) & (s["d"] < pd.Timestamp("2026-07-15"))]
bb = s[(s["d"] > pd.Timestamp("2026-07-15")) & (s["d"] <= pd.Timestamp("2026-07-25"))]
p(f"    파티클 불량 비중: 전 {aa['particle_defects'].sum()/aa['defect_count'].sum():.3f} "
  f"→ 후 {bb['particle_defects'].sum()/bb['defect_count'].sum():.3f}")
p("    → 스펙 초과 부품이라고 다 수율을 떨어뜨리지는 않는다. 항목이 다르다:")
p("       HC-40 의 resistance_dev(저항 편차)는 온도 계통, SH-2200 의 hole_dia_sd(홀 지름 산포)는 가스 분사 계통이다.")

# ------------------------------------------------ 5. 08-10 특별 세정 효과
head("5. 08-10 CH-3B 특별 세정(파티클 대응, 180분) 뒤에 돌아왔나")
s = y[y["chamber"] == "CH-3B"]
segs = [("07-01~07-27 (사건 전)", "2026-07-01", "2026-07-27"),
        ("07-29~08-09 (하락 후)", "2026-07-29", "2026-08-09"),
        ("08-11~08-25 (특별세정 후)", "2026-08-11", "2026-08-25")]
for nm, s1, s2 in segs:
    z = s[(s["d"] >= pd.Timestamp(s1)) & (s["d"] <= pd.Timestamp(s2))]
    p(f"    {nm:<28} 수율 {z['yield_pct'].mean():.3f}%p  로트 {len(z)}  "
      f"파티클비중 {z['particle_defects'].sum()/z['defect_count'].sum():.3f}")
a = s[(s["d"] >= pd.Timestamp("2026-07-29")) & (s["d"] <= pd.Timestamp("2026-08-09"))]["yield_pct"].tolist()
b = s[(s["d"] >= pd.Timestamp("2026-08-11")) & (s["d"] <= pd.Timestamp("2026-08-25"))]["yield_pct"].tolist()
d, pv = perm_test(a, b)
p(f"    특별세정 전후: {d:+.3f}%p  p={pv:.4f}")
p("    → 세정으로 안 돌아온다는 것은 챔버 벽 오염이 아니라 부품 자체가 계속 만들고 있다는 쪽에 맞는다.")

# ------------------------------------------------------ 6. 하락 시점 정밀
head("6. 하락이 07-28 작업 직후인가 (CH-3B 일자별)")
s = y[y["chamber"] == "CH-3B"].groupby("d").agg(
    lots=("yield_pct", "size"), yld=("yield_pct", "mean"),
    dfc=("defect_count", "mean"), ptc=("particle_defects", "mean")).reset_index()
for _, r in s[(s["d"] >= pd.Timestamp("2026-07-20")) & (s["d"] <= pd.Timestamp("2026-08-05"))].iterrows():
    mark = ""
    ev = e[(e["d"] == r["d"]) & (e["chamber"] == "CH-3B")]
    if len(ev):
        mark = "  ← " + " / ".join(ev["detail"].tolist())
    p(f"    {r['d'].date()}  로트{int(r['lots'])}  수율 {r['yld']:.3f}  불량 {r['dfc']:.1f}  파티클 {r['ptc']:.1f}{mark}")

with open("evidence.txt", "w") as f:
    f.write(OUT.getvalue())
p("")
p("[evidence.txt 에 기록됨]")
