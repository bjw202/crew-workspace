#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""다음 조치(샤워헤드 재교체)의 검증 설계를 숫자로 낸다.
- 대체할 재고 후보가 있는지
- 몇 로트를 봐야 판정이 서는지 (모의실험으로 검출력 산출)
출력: out/03_next_step.txt
"""
import pandas as pd
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
OUT = os.path.join(BASE, "out")
RNG = np.random.default_rng(11)

lines = []
def p(s=""):
    lines.append(str(s)); print(s)

def rd(fn):
    df = pd.read_csv(os.path.join(DATA, fn), dtype=str)
    for c in df.columns:
        if c.endswith("date"):
            df[c] = pd.to_datetime(df[c].str.replace("/", "-", regex=False), errors="coerce")
    return df

yl = rd("yield_by_lot.csv"); yl["yield_pct"] = pd.to_numeric(yl["yield_pct"])
yl["particle_defects"] = pd.to_numeric(yl["particle_defects"])
pi = rd("part_incoming_inspection.csv").drop_duplicates().reset_index(drop=True)
pi["measured_num"] = pd.to_numeric(pi["measured"]); pi["spec_max_num"] = pd.to_numeric(pi["spec_max"])
pi["conv"] = [m * (1000.0 if (it == "hole_dia_sd" and u == "mm") else 1.0)
              for m, u, it in zip(pi["measured_num"], pi["unit"], pi["spec_item"])]
pi["판정"] = np.where(pi["conv"] > pi["spec_max_num"], "불합격", "합격")

p("=" * 74)
p("1. 바꿔 끼울 샤워헤드가 재고에 있나 (설치 기록이 없는 SH-2200)")
p("=" * 74)
sh = pi[(pi["part_no"] == "SH-2200")].sort_values(["recv_date", "serial"])
stock = sh[sh["install_date"].isna()]
p(f"{'입고':<12}{'serial':<16}{'공급사':<12}{'실측(um)':>10}{'규격':>7}  판정")
for _, r in stock.iterrows():
    p(f"{str(r['recv_date'].date()):<12}{r['serial']:<16}{r['supplier']:<12}"
      f"{r['conv']:>10.4g}{r['spec_max_num']:>7.1f}  {r['판정']}")
ok = stock[stock["판정"] == "합격"]
p(f"\n  규격을 통과한 재고 샤워헤드: {len(ok)}개 → {list(ok['serial'])}")
p(f"  가장 여유가 큰 것: {ok.loc[ok['conv'].idxmin(),'serial']} "
  f"({ok['conv'].min():.4g} um, 규격의 {ok['conv'].min()/3.0*100:.0f}%)")
bad = stock[stock["판정"] == "불합격"]
p(f"  쓰면 안 되는 재고: {list(bad['serial'])} "
  f"(mm 로 적혀 있어 성적서를 그대로 보면 합격으로 오인된다)")

p("\n" + "=" * 74)
p("2. 바꿔 끼운 뒤 몇 로트를 봐야 판정이 서나")
p("=" * 74)
pre = yl[(yl["chamber"] == "CH-3B") & (yl["date"] <= "2026-07-28")]["yield_pct"]
post = yl[(yl["chamber"] == "CH-3B") & (yl["date"] >= "2026-07-29")]["yield_pct"]
sd_pre, sd_post = pre.std(ddof=1), post.std(ddof=1)
p(f"  사건 전 CH-3B 로트간 수율 표준편차: {sd_pre:.3f}%p (n={len(pre)})")
p(f"  사건 후 CH-3B 로트간 수율 표준편차: {sd_post:.3f}%p (n={len(post)})")
p(f"  되돌아와야 할 폭: {pre.mean() - post.mean():.3f}%p "
  f"(현재 {post.mean():.3f} → 사건 전 {pre.mean():.3f})")

p("\n  모의실험: 교체 뒤 수율이 사건 전 수준으로 완전히 돌아온다고 할 때,")
p("  로트 n 개만 보고 '돌아왔다'를 판정할 확률 (기준: 사건 후 최근 20로트와 비교, 순열검정 p<0.01)")
base = post.tail(20).to_numpy()
def perm_p(a, b, n=2000):
    obs = abs(a.mean() - b.mean()); pool = np.concatenate([a, b]); na = len(a); c = 0
    for _ in range(n):
        RNG.shuffle(pool)
        if abs(pool[:na].mean() - pool[na:].mean()) >= obs - 1e-12: c += 1
    return (c + 1) / (n + 1)

p(f"\n  {'로트수':>7}{'일수':>6}{'검출력':>9}")
for n in [4, 6, 8, 10, 12, 16, 20]:
    hits = 0; T = 300
    for _ in range(T):
        sim = RNG.normal(pre.mean(), sd_pre, n)
        if perm_p(sim, base, 1000) < 0.01: hits += 1
    p(f"  {n:>7}{n/2:>6.0f}{hits/T:>9.2f}")
p("\n  => 하루 2로트이므로 로트 8개 = 나흘. 나흘치면 완전 회복은 거의 확실히 잡힌다.")
p("     파티클 불량은 14.5 → 65 로 4.5배 벌어져 있어 수율보다 먼저 눈에 보인다.")

p("\n" + "=" * 74)
p("3. 부분 회복만 있을 때 (교체가 원인의 일부만 설명할 때) 필요한 로트 수")
p("=" * 74)
p(f"  {'회복폭':>8}{'로트8개':>10}{'로트12개':>10}{'로트20개':>10}")
for frac in [0.25, 0.5, 0.75, 1.0]:
    row = []
    target = post.mean() + frac * (pre.mean() - post.mean())
    for n in [8, 12, 20]:
        hits = 0; T = 300
        for _ in range(T):
            sim = RNG.normal(target, sd_pre, n)
            if perm_p(sim, base, 1000) < 0.01: hits += 1
        row.append(hits / T)
    p(f"  {frac*(pre.mean()-post.mean()):>7.2f}%p{row[0]:>10.2f}{row[1]:>10.2f}{row[2]:>10.2f}")
p("\n  => 절반만 회복해도 로트 8개로 잡힌다. 4분의 1 회복은 로트 20개(열흘)가 필요하다.")

with open(os.path.join(OUT, "03_next_step.txt"), "w") as f:
    f.write("\n".join(lines) + "\n")
print(f"\n[저장] {OUT}/03_next_step.txt")
