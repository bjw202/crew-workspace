#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자료 품질 감사 — 세 파일의 흠을 찾아 목록으로 낸다.
출력: out/01_data_audit.txt
"""
import pandas as pd
import numpy as np
import os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "out")
os.makedirs(OUT, exist_ok=True)

lines = []
def p(s=""):
    lines.append(str(s))
    print(s)

p("=" * 70)
p("자료 품질 감사")
p("=" * 70)

# ---------- 파일별 원자료를 문자열 그대로 읽는다 (형변환 전 흠을 보기 위해) ----------
yl = pd.read_csv(os.path.join(DATA, "yield_by_lot.csv"), dtype=str)
eq = pd.read_csv(os.path.join(DATA, "equipment_history.csv"), dtype=str)
pi = pd.read_csv(os.path.join(DATA, "part_incoming_inspection.csv"), dtype=str)

for name, df in [("yield_by_lot", yl), ("equipment_history", eq), ("part_incoming_inspection", pi)]:
    p(f"\n[{name}] {len(df)}행 x {len(df.columns)}열  열={list(df.columns)}")

# ---------- 1. 날짜 형식 ----------
p("\n" + "-" * 70)
p("1. 날짜 형식이 어긋난 행")
p("-" * 70)
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")
for name, df, cols in [("yield_by_lot", yl, ["date"]),
                       ("equipment_history", eq, ["date"]),
                       ("part_incoming_inspection", pi, ["recv_date", "install_date"])]:
    for c in cols:
        bad = df[df[c].notna() & (df[c] != "") & ~df[c].fillna("").str.match(ISO)]
        for i, r in bad.iterrows():
            p(f"  {name} 행{i+2}: {c}={r[c]!r}  ({dict(r)})")

# ---------- 2. 완전 중복 행 ----------
p("\n" + "-" * 70)
p("2. 완전히 같은 행이 두 번 나온 경우")
p("-" * 70)
for name, df in [("yield_by_lot", yl), ("equipment_history", eq), ("part_incoming_inspection", pi)]:
    dup = df[df.duplicated(keep=False)]
    if len(dup):
        p(f"  {name}: {len(dup)}행")
        for i, r in dup.iterrows():
            p(f"    행{i+2}: {list(r.values)}")
    else:
        p(f"  {name}: 없음")

# ---------- 3. 키 중복 (같은 serial 이 여러 번) ----------
p("\n" + "-" * 70)
p("3. 부품 검사 성적서: 같은 serial 이 여러 행")
p("-" * 70)
d = pi[pi.duplicated("serial", keep=False)].sort_values("serial")
if len(d):
    for i, r in d.iterrows():
        p(f"  행{i+2}: {list(r.values)}")
else:
    p("  없음")

p("\n  yield_by_lot: lot_id 중복 = %d건" % yl["lot_id"].duplicated().sum())

# ---------- 4. 단위 혼재 ----------
p("\n" + "-" * 70)
p("4. 같은 spec_item 안에서 단위가 섞인 경우")
p("-" * 70)
g = pi.groupby("spec_item")["unit"].unique()
for item, units in g.items():
    mark = "  <== 섞임" if len(units) > 1 else ""
    p(f"  {item}: {list(units)}{mark}")

p("\n  단위가 섞인 항목의 개별 행:")
for item, units in g.items():
    if len(units) > 1:
        for i, r in pi[pi["spec_item"] == item].iterrows():
            p(f"    행{i+2}: {r['serial']} measured={r['measured']} {r['unit']} (spec_max={r['spec_max']} {units[0]})")

# ---------- 5. 결측 ----------
p("\n" + "-" * 70)
p("5. 결측값")
p("-" * 70)
for name, df in [("yield_by_lot", yl), ("equipment_history", eq), ("part_incoming_inspection", pi)]:
    p(f"  [{name}]")
    for c in df.columns:
        n = df[c].isna().sum() + (df[c].fillna("") == "").sum()
        if n:
            p(f"    {c}: {n}건")

p("\n  equipment_history 에서 worker 가 빈 행:")
for i, r in eq[eq["worker"].isna() | (eq["worker"].fillna("") == "")].iterrows():
    p(f"    행{i+2}: {list(r.values)}")

p("\n  part_incoming_inspection 에서 supplier 가 빈 행:")
for i, r in pi[pi["supplier"].isna() | (pi["supplier"].fillna("") == "")].iterrows():
    p(f"    행{i+2}: {list(r.values)}")

# ---------- 6. 자료 기간 ----------
p("\n" + "-" * 70)
p("6. 각 자료가 덮는 기간")
p("-" * 70)
def norm(s):
    return pd.to_datetime(s.str.replace("/", "-", regex=False), errors="coerce")
p(f"  yield_by_lot:             {norm(yl['date']).min().date()} ~ {norm(yl['date']).max().date()}")
p(f"  equipment_history:        {norm(eq['date']).min().date()} ~ {norm(eq['date']).max().date()}")
p(f"  part_incoming_inspection: {norm(pi['recv_date']).min().date()} ~ {norm(pi['recv_date']).max().date()}")
p("  => 설비 이력은 08-20 에서 끊긴다. 수율은 08-25 까지 있다. 마지막 5일은 설비 이력이 없다.")

# ---------- 7. 수율 자료의 구조 ----------
p("\n" + "-" * 70)
p("7. 수율 자료 구조 점검")
p("-" * 70)
yl2 = yl.copy()
yl2["date"] = norm(yl2["date"])
yl2["yield_pct"] = pd.to_numeric(yl2["yield_pct"], errors="coerce")
yl2["defect_count"] = pd.to_numeric(yl2["defect_count"], errors="coerce")
yl2["particle_defects"] = pd.to_numeric(yl2["particle_defects"], errors="coerce")
p(f"  챔버: {sorted(yl2['chamber'].unique())}")
p(f"  라인-챔버 짝: {sorted(set(zip(yl2['line'], yl2['chamber'])))}")
cnt = yl2.groupby("chamber").size()
p(f"  챔버별 로트 수: {dict(cnt)}")
d_cnt = yl2.groupby(["chamber", "date"]).size().unstack(fill_value=0)
p(f"  하루당 로트 수 분포: {sorted(set(d_cnt.values.flatten()))}")
p(f"  수율 범위: {yl2['yield_pct'].min()} ~ {yl2['yield_pct'].max()}")
p(f"  수율 결측: {yl2['yield_pct'].isna().sum()}건")
p(f"  particle_defects > defect_count 인 행: {(yl2['particle_defects'] > yl2['defect_count']).sum()}건")
# 날짜 빠짐
alld = pd.date_range(yl2["date"].min(), yl2["date"].max())
for ch in sorted(yl2["chamber"].unique()):
    have = set(yl2[yl2["chamber"] == ch]["date"])
    miss = [d.date() for d in alld if d not in have]
    p(f"  {ch}: 로트가 없는 날 {len(miss)}일" + (f" 예: {miss[:6]}" if miss else ""))

# ---------- 8. 설비 이력의 챔버가 수율 자료에 다 있나 ----------
p("\n" + "-" * 70)
p("8. 표기 흔들림 (같은 것을 다르게 적은 경우)")
p("-" * 70)
p(f"  equipment_history 챔버: {sorted(eq['chamber'].unique())}")
p(f"  event_type: {sorted(eq['event_type'].unique())}")
p("  PART 이벤트의 detail 표기:")
for i, r in eq[eq["event_type"] == "PART"].iterrows():
    p(f"    행{i+2}: {r['date']} {r['chamber']} {r['detail']!r}")
p("  => 샤워헤드 교체가 한글('샤워헤드(SH-2200) 교체')과 영문('Showerhead SH-2200 교체')으로 갈려 적혀 있다.")

with open(os.path.join(OUT, "01_data_audit.txt"), "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"\n[저장] {os.path.join(OUT, '01_data_audit.txt')}")
