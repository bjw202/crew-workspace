# -*- coding: utf-8 -*-
"""04. 다음 한 가지의 판정 기준을 숫자로 만든다."""
import pandas as pd, numpy as np, os
BASE=os.path.dirname(os.path.abspath(__file__)); D=os.path.join(BASE,"data")
out=[]
def p(*a):
    s=" ".join(str(x) for x in a); print(s); out.append(s)
def fx(s): return pd.to_datetime(s.astype(str).str.replace("/","-",regex=False),errors="coerce")
y=pd.read_csv(os.path.join(D,"yield_by_lot.csv")); y["date"]=fx(y["date"])
ins=pd.read_csv(os.path.join(D,"part_incoming_inspection.csv")).drop_duplicates()
ins["recv_date"]=fx(ins.recv_date); ins["install_date"]=fx(ins.install_date)
ins["spec_max"]=ins.spec_max.astype(float)
ins["norm"]=[float(m)*1000 if (si=="hole_dia_sd" and str(u).strip()=="mm") else float(m)
             for m,u,si in zip(ins.measured,ins.unit,ins.spec_item)]

g=y[y.chamber=="CH-3B"]
pre =g[g.date<=pd.Timestamp("2026-07-28")]
post=g[g.date>=pd.Timestamp("2026-07-29")]
p("="*74); p("[1] 판정 기준의 근거가 되는 산포")
p(f"  CH-3B 하락 전  수율 mean={pre.yield_pct.mean():.3f} sd={pre.yield_pct.std(ddof=1):.3f} (로트 {len(pre)}개)")
p(f"  CH-3B 하락 전  파티클 mean={pre.particle_defects.mean():.2f} sd={pre.particle_defects.std(ddof=1):.2f}")
p(f"  CH-3B 하락 후  수율 mean={post.yield_pct.mean():.3f}  파티클 mean={post.particle_defects.mean():.2f}")
p(f"  하루 로트 수 = {y.groupby(['chamber','date']).size().unique()} (일정)")
for days in (5,7,10,14):
    n=days*2; se_y=pre.yield_pct.std(ddof=1)/np.sqrt(n); se_p=pre.particle_defects.std(ddof=1)/np.sqrt(n)
    p(f"  {days:2d}일({n:2d}로트) 평균의 표준오차: 수율 {se_y:.3f}pp / 파티클 {se_p:.2f}개"
      f"  -> 회복 판정선(하락전평균-2SE) 수율 >= {pre.yield_pct.mean()-2*se_y:.2f}, 파티클 <= {pre.particle_defects.mean()+2*se_p:.1f}")

p("\n"+"="*74); p("[2] 교체용 여유 SH-2200 재고 (install_date 비어 있고 규격 적합)")
sh=ins[(ins.part_no=="SH-2200")&(ins.install_date.isna())].copy()
sh["판정"]=np.where(sh.norm>sh.spec_max,"이탈","적합")
p(sh[["recv_date","serial","supplier","measured","unit","norm","spec_max","판정"]].to_string(index=False))
ok=sh[sh.norm<=sh.spec_max].sort_values("norm")
p(f"\n  적합품 {len(ok)}개. 규격(3.0um) 여유가 큰 순: " +
  ", ".join(f"{r.serial}({r.norm:g}um{', 원기록 mm' if str(r.unit).strip()=='mm' else ''})" for _,r in ok.iterrows()))

p("\n"+"="*74); p("[3] 방치 비용 (현재 자료 범위 안에서만)")
d=post.yield_pct.mean()-pre.yield_pct.mean()
ndays=(pd.Timestamp("2026-08-25")-pd.Timestamp("2026-07-29")).days+1
p(f"  수율 격차 {d:+.3f} pp, 하루 CH-3B 로트 2개")
p(f"  07-29 ~ 08-25 {ndays}일 = {len(post)}로트가 격차를 안고 나갔다")
p(f"  격차가 하루 더 이어질 때 = 로트 2개 x {abs(d):.2f} pp")
p(f"  파티클 불량 초과분 = 로트당 {post.particle_defects.mean()-pre.particle_defects.mean():+.1f}개, "
  f"{len(post)}로트 누적 {(post.particle_defects.mean()-pre.particle_defects.mean())*len(post):.0f}개")
with open(os.path.join(BASE,"out","04_next_action.txt"),"w") as f: f.write("\n".join(out)+"\n")
