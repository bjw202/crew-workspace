# -*- coding: utf-8 -*-
"""01. 자료 품질 점검 — 세 파일의 흠을 기계적으로 찾는다."""
import pandas as pd, sys, os, re

BASE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(BASE, "data")
out = []
def p(*a):
    s = " ".join(str(x) for x in a)
    print(s); out.append(s)

ins = pd.read_csv(os.path.join(D, "part_incoming_inspection.csv"), dtype=str)
eq  = pd.read_csv(os.path.join(D, "equipment_history.csv"), dtype=str)
y   = pd.read_csv(os.path.join(D, "yield_by_lot.csv"), dtype=str)

p("=" * 70)
p("[A] 행 수 / 컬럼")
for nm, df in (("incoming", ins), ("equipment", eq), ("yield", y)):
    p(f"  {nm:10s} rows={len(df):4d} cols={list(df.columns)}")

p("=" * 70)
p("[B] 날짜 형식 이상 (YYYY-MM-DD 가 아닌 값)")
def bad_dates(df, col, label):
    if col not in df.columns: return
    m = df[col].notna() & ~df[col].fillna("").str.match(r"^\d{4}-\d{2}-\d{2}$")
    m &= df[col].fillna("") != ""
    for i, r in df[m].iterrows():
        p(f"  {label}.{col} 행{i+2}: {r[col]!r}  ({dict(r)})")
for df, col, lab in ((ins,"recv_date","incoming"), (ins,"install_date","incoming"),
                     (eq,"date","equipment"), (y,"date","yield")):
    bad_dates(df, col, lab)

p("=" * 70)
p("[C] 완전 중복 행")
for nm, df in (("incoming", ins), ("equipment", eq), ("yield", y)):
    d = df[df.duplicated(keep=False)]
    if len(d):
        p(f"  {nm}: 중복 {len(d)}행")
        for i, r in d.iterrows(): p(f"    행{i+2}: {list(r.values)}")
    else:
        p(f"  {nm}: 없음")

p("=" * 70)
p("[D] 키 중복 (incoming: serial 이 두 번 이상)")
vc = ins["serial"].value_counts()
for s, n in vc[vc > 1].items():
    p(f"  serial={s} 가 {n}회")
    p(ins[ins.serial == s].to_string())

p("=" * 70)
p("[E] 빈 칸 (필수로 보이는 컬럼)")
for nm, df, cols in (("incoming", ins, ["recv_date","part_no","serial","supplier","spec_item","spec_max","measured","unit"]),
                     ("equipment", eq, ["date","chamber","event_type","detail","duration_min","worker"])):
    for c in cols:
        m = df[c].isna() | (df[c].fillna("").str.strip() == "")
        if m.any():
            for i in df[m].index:
                p(f"  {nm}.{c} 행{i+2} 비어 있음 → {list(df.loc[i].values)}")

p("=" * 70)
p("[F] 단위 불일치 (같은 spec_item 인데 unit 이 다름)")
g = ins.groupby("spec_item")["unit"].unique()
for item, units in g.items():
    mark = "  <== 섞임" if len(units) > 1 else ""
    p(f"  {item:16s} units={list(units)}{mark}")
    if len(units) > 1:
        p(ins[ins.spec_item == item][["recv_date","part_no","serial","supplier","spec_max","measured","unit","install_date","chamber"]].to_string())

p("=" * 70)
p("[G] equipment detail 표기 흔들림 (같은 부품 교체인데 문구가 다름)")
for i, r in eq[eq.event_type == "PART"].iterrows():
    p(f"  행{i+2} {r['date']} {r['chamber']:6s} {r['detail']!r}")

p("=" * 70)
p("[H] yield 수치 이상 (범위 / 결측 / particle > defect)")
yn = y.copy()
for c in ["yield_pct","defect_count","particle_defects"]:
    yn[c] = pd.to_numeric(yn[c], errors="coerce")
p(f"  yield_pct  결측={yn.yield_pct.isna().sum()}  min={yn.yield_pct.min()}  max={yn.yield_pct.max()}")
p(f"  defect_count 결측={yn.defect_count.isna().sum()}")
bad = yn[yn.particle_defects > yn.defect_count]
p(f"  particle_defects > defect_count 인 행: {len(bad)}")
p(f"  lot_id 중복: {yn.lot_id.duplicated().sum()}")
p(f"  기간: {y.date.min()} ~ {y.date.max()}")
p(f"  챔버: {sorted(y.chamber.unique())}")
p(f"  챔버×일자 로트 수 분포: {yn.groupby(['chamber','date']).size().value_counts().to_dict()}")

p("=" * 70)
p("[I] 자료 기간 어긋남")
p(f"  yield     : {y.date.min()} ~ {y.date.max()}")
p(f"  equipment : {eq.date.str.replace('/','-').min()} ~ {eq.date.str.replace('/','-').max()}")
p(f"  incoming  : {ins.recv_date.str.replace('/','-').min()} ~ {ins.recv_date.str.replace('/','-').max()}")

with open(os.path.join(BASE, "out", "01_data_audit.txt"), "w") as f:
    f.write("\n".join(out) + "\n")
