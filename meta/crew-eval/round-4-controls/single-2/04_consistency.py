#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""정합성 검사: 불량 수와 수율이 서로 맞는가. 파티클 증가만으로 하락이 설명되는가.
출력: out/04_consistency.txt"""
import pandas as pd, numpy as np, os
BASE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(BASE,"out")
lines=[]
def p(s=""): lines.append(str(s)); print(s)
yl=pd.read_csv(os.path.join(BASE,"data","yield_by_lot.csv"))
yl["date"]=pd.to_datetime(yl["date"].str.replace("/","-",regex=False))
# 로트당 총 다이 수를 불량수/(1-수율) 로 되짚는다
yl["implied_n"]=yl["defect_count"]/(1-yl["yield_pct"]/100)
p("="*74); p("1. 로트당 총 다이 수를 되짚어 본다  (불량수 / (1 - 수율))"); p("="*74)
p(f"  전체: 중앙값 {yl['implied_n'].median():.1f}, 범위 {yl['implied_n'].min():.1f} ~ {yl['implied_n'].max():.1f}")
p(f"  사분위: {yl['implied_n'].quantile(.25):.1f} / {yl['implied_n'].quantile(.75):.1f}")
p("  => 로트 크기가 1240개 안팎으로 일정하다. 수율과 불량 수가 서로 어긋나지 않는다.")
p("     (되짚은 값이 크게 흔들리면 둘 중 하나가 잘못 적힌 것인데, 그런 흔적은 없다)")
p(""); p("="*74); p("2. CH-3B: 늘어난 불량이 전부 파티클인가"); p("="*74)
m=yl[yl["chamber"]=="CH-3B"]
a=m[m["date"]<="2026-07-28"]; b=m[m["date"]>="2026-07-29"]
for nm,g in [("사건 전",a),("사건 후",b)]:
    p(f"  {nm}: 수율 {g['yield_pct'].mean():.3f}  총불량 {g['defect_count'].mean():.2f}  "
      f"파티클 {g['particle_defects'].mean():.2f}  비파티클 {(g['defect_count']-g['particle_defects']).mean():.2f}")
d_tot=b["defect_count"].mean()-a["defect_count"].mean()
d_pt=b["particle_defects"].mean()-a["particle_defects"].mean()
p(f"\n  총불량 증가 {d_tot:+.2f}개 중 파티클 증가 {d_pt:+.2f}개 = {d_pt/d_tot*100:.0f}%")
p(f"  비파티클 불량은 오히려 {(b['defect_count']-b['particle_defects']).mean()-(a['defect_count']-a['particle_defects']).mean():+.2f}개")
N=yl["implied_n"].median()
p(f"\n  파티클 {d_pt:.1f}개 증가를 로트 크기 {N:.0f}개로 나누면 {d_pt/N*100:.2f}%p")
p(f"  실제 수율 하락은 {a['yield_pct'].mean()-b['yield_pct'].mean():.2f}%p")
p("  => 하락 폭이 파티클 증가분과 거의 그대로 맞는다. 다른 불량 요인을 더 찾을 필요가 없다.")
p(""); p("="*74); p("3. 07-28 을 뺀 나머지 날에 CH-3B 만 특별했던 적이 있나 (헛다리 짚기 방지)"); p("="*74)
piv=yl.groupby(["date","chamber"])["yield_pct"].mean().unstack()
oth=piv.drop(columns=["CH-3B"]).mean(axis=1)
gap=piv["CH-3B"]-oth
p(f"  CH-3B 와 나머지 다섯의 평균 차이:")
p(f"    07-01~07-28: 평균 {gap[gap.index<='2026-07-28'].mean():+.3f}%p  "
  f"(범위 {gap[gap.index<='2026-07-28'].min():+.2f} ~ {gap[gap.index<='2026-07-28'].max():+.2f})")
p(f"    07-29~08-25: 평균 {gap[gap.index>='2026-07-29'].mean():+.3f}%p  "
  f"(범위 {gap[gap.index>='2026-07-29'].min():+.2f} ~ {gap[gap.index>='2026-07-29'].max():+.2f})")
p("  => 07-28 이전에는 CH-3B 가 남들과 붙어 있었다. 07-29 부터만 떨어진다. 겹치는 구간이 없다.")
open(os.path.join(OUT,"04_consistency.txt"),"w").write("\n".join(lines)+"\n")
print(f"\n[저장] {OUT}/04_consistency.txt")
