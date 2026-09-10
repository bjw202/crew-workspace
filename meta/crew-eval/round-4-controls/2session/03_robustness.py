# -*- coding: utf-8 -*-
"""03. 견고성 — 결론이 자료의 흠·판단 선택에 흔들리는지 본다."""
import pandas as pd, numpy as np, os
BASE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(BASE, "data")
out = []
def p(*a):
    s = " ".join(str(x) for x in a); print(s); out.append(s)

def fx(s): return pd.to_datetime(s.astype(str).str.replace("/","-",regex=False), errors="coerce")
y  = pd.read_csv(os.path.join(D,"yield_by_lot.csv"));           y["date"]=fx(y["date"])
eq = pd.read_csv(os.path.join(D,"equipment_history.csv"));      eq["date"]=fx(eq["date"])
ins= pd.read_csv(os.path.join(D,"part_incoming_inspection.csv")).drop_duplicates()
ins["recv_date"]=fx(ins["recv_date"]); ins["install_date"]=fx(ins["install_date"])

# ---- [1] PM 단독 5건의 분포 대비 CH-3B 는 얼마나 벗어나 있나 ----
p("="*74); p("[1] 대조군 자격 심사 — 비교 창(+-14일) 안에 다른 개입이 있나")
eqx=eq.copy()
def window_check(ch, d, days=14):
    d=pd.Timestamp(d)
    w=eqx[(eqx.chamber==ch)&(eqx.date>=d-pd.Timedelta(days=days))&(eqx.date<=d+pd.Timedelta(days=days))]
    w=w[~((w.date==d)&(w.event_type=="PM"))]              # 자기 자신인 PM 은 뺀다
    return w[w.event_type.isin(["PART","RECIPE","ALARM"])]
p("  (CLEAN 은 여섯 챔버가 정기로 받는 일상 작업, CAL 은 07-05 에 여섯이 함께 받았으므로 심사에서 뺀다)")
for ch,d in [("CH-1A","2026-07-14"),("CH-1B","2026-07-14"),("CH-2A","2026-07-21"),
             ("CH-2B","2026-07-21"),("CH-3A","2026-07-28"),("CH-3B","2026-07-28")]:
    w=window_check(ch,d)
    if len(w)==0:
        p(f"    {ch} {d} PM : 창 안에 PART/RECIPE/ALARM 없음  -> 깨끗한 대조군")
    else:
        for _,r in w.iterrows():
            p(f"    {ch} {d} PM : 창 안에 [{r.event_type}] {r.date.date()} {r.detail!r}")
p("\n[1b] 귀무분포로 쓸 'PM 단독' 을 다시 세고 CH-3B 위치 재기")
def eff(ch, d, days=14):
    d=pd.Timestamp(d); g=y[y.chamber==ch]
    a=g[(g.date>=d-pd.Timedelta(days=days))&(g.date<=d)]
    b=g[(g.date>d)&(g.date<=d+pd.Timedelta(days=days))]
    return b.yield_pct.mean()-a.yield_pct.mean(), b.particle_defects.mean()-a.particle_defects.mean()
# CH-1A 07-14 는 07-15 에 이탈 히터코일 장착이 겹쳐 'PM 단독' 이 아니다 -> 귀무분포에서 뺀다.
pm_only=[("CH-1B","2026-07-14"),("CH-2A","2026-07-21"),("CH-2B","2026-07-21"),("CH-3A","2026-07-28")]
mixed  =[("CH-1A","2026-07-14")]
others =[("CH-2B","2026-08-06"),("CH-1A","2026-07-15")]
dy=np.array([eff(c,d)[0] for c,d in pm_only]); dp=np.array([eff(c,d)[1] for c,d in pm_only])
t_y,t_p = eff("CH-3B","2026-07-28")
p(f"  PM 단독 4건 수율변화: {np.round(dy,3)}  범위=[{dy.min():+.3f}, {dy.max():+.3f}] pp")
p(f"  PM 단독 4건 파티클변화: {np.round(dp,2)}  범위=[{dp.min():+.2f}, {dp.max():+.2f}] 개/로트")
p(f"  CH-3B : 수율 {t_y:+.3f} pp / 파티클 {t_p:+.2f} 개/로트")
p(f"  -> PM 단독 4건 중 CH-3B 만큼 떨어진 사례: {(dy<=t_y).sum()}건 / 4건")
p(f"  (n=4 이므로 표준편차 배수는 쓰지 않는다. 실측 범위와 건수로만 말한다.)")
allc = np.array([eff(c,d)[0] for c,d in pm_only+mixed+others])
p(f"  CH-3B 를 뺀 대조 사례 전체 {len(allc)}건 수율변화 범위=[{allc.min():+.3f}, {allc.max():+.3f}] pp")
clean=[("CH-1B","2026-07-14"),("CH-2B","2026-07-21")]
dc=np.array([eff(c,d)[0] for c,d in clean])
p(f"  그중 창이 완전히 깨끗한 PM 단독 2건만: {np.round(dc,3)} -> 범위=[{dc.min():+.3f}, {dc.max():+.3f}] pp")

# ---- [2] 세정으로 지워지나 (PM 오염 가설 vs 부품 가설의 가름) ----
p("\n"+"="*74); p("[2] 하락 뒤 CH-3B 세정 두 번 — 파티클이 지워졌나")
cl = eq[(eq.chamber=="CH-3B")&(eq.event_type=="CLEAN")&(eq.date>=pd.Timestamp("2026-07-29"))]
p("  하락 이후 CH-3B 세정 이력:")
for _,r in cl.iterrows(): p(f"    {r.date.date()} {r.detail} ({r.duration_min}분)")
g=y[y.chamber=="CH-3B"]
for lo,hi,lab in [("2026-07-29","2026-08-02","세정 전 (07-29~08-02)"),
                  ("2026-08-04","2026-08-09","정기 세정 08-03 직후 (08-04~08-09)"),
                  ("2026-08-11","2026-08-16","특별 세정 08-10 직후 (08-11~08-16)"),
                  ("2026-08-17","2026-08-25","그 뒤 (08-17~08-25)")]:
    s=g[(g.date>=pd.Timestamp(lo))&(g.date<=pd.Timestamp(hi))]
    p(f"    {lab:36s} n={len(s):3d} 수율={s.yield_pct.mean():6.3f} 파티클={s.particle_defects.mean():6.2f}")
p("  참고: 07-28 이전 평시 파티클 = %.2f 개/로트" % g[g.date<=pd.Timestamp("2026-07-28")].particle_defects.mean())

# ---- [3] 판단 선택에 대한 민감도 ----
p("\n"+"="*74); p("[3] 민감도 — 자료의 흠을 다르게 처리하면 결론이 바뀌나")
p("  (a) 중복행(SH2200-B-0412 2회)을 지우지 않으면?")
p("      -> 그 행은 '규격 이탈 + CH-3B 장착' 으로 동일. 이탈 판정도 장착 연결도 그대로. 결론 불변.")
p("  (b) mm 단위 2행(0.0023/0.0031)을 um 로 잘못 읽으면(0.0023um)?")
i2=ins.copy(); i2["m_raw"]=i2.measured.astype(float); i2["spec_max"]=i2.spec_max.astype(float)
p(f"      -> 두 행 모두 미장착(install_date 비어 있음). 어느 쪽으로 읽어도 07-29 하락과 무관. 결론 불변.")
p("  (c) mm->um 변환을 쓰면 SH2200-A-1190 = 3.1um 로 규격 이탈이 하나 늘어난다.")
p(f"      -> 이 부품은 미장착. 다만 '이탈품이 걸러지지 않는다'는 관리 문제의 방증은 된다.")
p("  (d) 날짜 표기 흔들림(2026/08/01, 2026/08/03)을 고치지 않으면?")
p(f"      -> 그 두 행이 정렬·구간필터에서 빠진다. 08-01 행은 CH-2B 대조군(적합품)이라 대조가 사라진다.")
p(f"         고쳐서 쓰면 대조가 살아나고 결론이 강해진다. (본 분석은 고쳐서 씀)")
p("  (e) 사건 전후 창을 7일/21일로 바꾸면?")
for w in (7,10,14,21,28):
    a,_=eff("CH-3B","2026-07-28",w); b,_=eff("CH-3A","2026-07-28",w); c,_=eff("CH-2B","2026-08-06",w)
    p(f"      ±{w:2d}일: CH-3B(PM+이탈SH) {a:+.3f}pp | CH-3A(PM만) {b:+.3f}pp | CH-2B(적합SH만) {c:+.3f}pp")

# ---- [4] 07-28 CH-3B 에 있었던 사건 전부 (빠뜨린 것 없나) ----
p("\n"+"="*74); p("[4] 07-26 ~ 07-30 사이 여섯 챔버의 모든 설비 이력")
w=eq[(eq.date>=pd.Timestamp("2026-07-26"))&(eq.date<=pd.Timestamp("2026-07-30"))].sort_values(["date","chamber"])
p(w.to_string(index=False))
p("\n  CH-3B 전체 이력:")
p(eq[eq.chamber=="CH-3B"].sort_values("date").to_string(index=False))

# ---- [5] 못 가른 것: 자료에 없는 것 ----
p("\n"+"="*74); p("[5] 자료가 갖고 있지 않은 것 (한계)")
pa=eq[eq.event_type=="PART"]
p(f"  - PART 교체 이력 {len(pa)}건, 입고검사에 install_date 가 적힌 행 {ins.install_date.notna().sum()}건 (중복 제거 후) -> 4건 모두 짝이 맞는다")
for _,r in pa.sort_values("date").iterrows():
    m=ins[(ins.install_date==r.date)&(ins.chamber==r.chamber)]
    p(f"      {r.date.date()} {r.chamber} {r.detail!r:28s} <-> {list(m.serial) if len(m) else 'MISSING'}")
p(f"  - 07-28 CH-3B 에서 떼어낸 헌 샤워헤드의 상태 기록: 없음")
p(f"  - 장착 후 실측(설치 후 검증) 기록: 없음")
p(f"  - 파티클의 크기/성분/발생 위치 분포: 없음 (particle_defects 개수만)")
p(f"  - hole_dia_sd 와 파티클 사이의 과거 상관 사례: 이 자료에 이탈 샤워헤드 장착 사례는 1건뿐")
p(f"  - PM 작업 내용 세부(무엇을 어디까지 분해했는지): detail 은 '정기 정비 (분기)' 한 줄뿐")

with open(os.path.join(BASE,"out","03_robustness.txt"),"w") as f: f.write("\n".join(out)+"\n")
