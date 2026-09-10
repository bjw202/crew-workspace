# -*- coding: utf-8 -*-
# 회차 5 자료 생성기 — meta 가 돌린다. 봇에게 보이지 않는 자리다.
#   python3 notes/round-5-gen.py
# 회차 4 자료(round-4-controls/data/yield_by_lot.csv)의 챔버별 8월 분포를 이어서
# 2026-08-26 ~ 09-03 아홉 날의 로트 수율을 만든다. 씨앗 고정. 심은 것은 round-5-answer-key.md 에 적는다.
import csv, random, statistics as st, os
random.seed(20260909)
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'..','round-4-controls','data','yield_by_lot.csv')
OUT=os.path.join(HERE,'..','round-5-data')
rows=list(csv.DictReader(open(SRC)))
LOT=1200  # 로트 크기 (불량 수와 수율에서 되짚은 값)
chambers=['CH-1A','CH-1B','CH-2A','CH-2B','CH-3A','CH-3B']
line={'CH-1A':1,'CH-1B':1,'CH-2A':2,'CH-2B':2,'CH-3A':3,'CH-3B':3}
base={}
for c in chambers:
    g=[r for r in rows if r['chamber']==c and r['date']>='2026-08-01']
    y=[float(r['yield_pct']) for r in g]; p=[int(r['particle_defects'])/int(r['defect_count']) for r in g]
    base[c]=(st.mean(y),st.stdev(y),st.mean(p))
# CH-3B: 08-27 교체 뒤 부분 회복 — 수율 92.6 (기준선 93.7 · 하락 후 90.1), 파티클 비율 0.31 (기준선 0.19 · 하락 후 0.55)
dates=['2026-08-%02d'%d for d in range(26,32)]+['2026-09-%02d'%d for d in range(1,4)]
out=[]; lot=1673
for d in dates:
    for c in chambers:
        for k in range(2):
            m,sd,ps=base[c]
            if c=='CH-3B':
                if d<='2026-08-27': m,sd,ps=90.10,0.90,0.548
                else: m,sd,ps=92.60,0.90,0.31
            y=round(random.gauss(m,sd),2)
            defects=max(1,round((100-y)/100*LOT))
            particles=max(0,round(defects*random.gauss(ps,0.02)))
            out.append({'lot_id':'L%d'%lot,'date':d,'line':line[c],'chamber':c,'yield_pct':'%.2f'%y,'defect_count':defects,'particle_defects':particles}); lot+=1
# 함정 넷
i_dup=[i for i,r in enumerate(out) if r['chamber']=='CH-3B' and r['date']=='2026-08-29'][0]      # ① 중복 행 (교체 뒤 CH-3B)
i_date=[i for i,r in enumerate(out) if r['chamber']=='CH-3A' and r['date']=='2026-08-30'][0]     # ② 날짜 형식
i_blank=[i for i,r in enumerate(out) if r['chamber']=='CH-2B' and r['date']=='2026-08-28'][1]    # ③ 빈 칸 (particle_defects)
i_case=[i for i,r in enumerate(out) if r['chamber']=='CH-3B' and r['date']=='2026-09-01'][0]     # ④ 표기 흔들림 (ch-3b)
out[i_date]['date']='2026/08/30'
out[i_blank]['particle_defects']=''
out[i_case]['chamber']='ch-3b'
out.insert(i_dup+1, dict(out[i_dup]))
with open(os.path.join(OUT,'yield_by_lot_addendum.csv'),'w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['lot_id','date','line','chamber','yield_pct','defect_count','particle_defects']); w.writeheader(); w.writerows(out)
eq=[
('2026-08-26','CH-1A','CLEAN','챔버 정기 세정',45,'박세정'),
('2026-08-27','CH-3B','PART','샤워헤드(SH-2200) 교체 — SH2200-B-0412 탈거 · SH2200-B-0413 장착',100,'김정비'),
('2026-08-27','CH-3B','CLEAN','챔버 정기 세정',60,'박세정'),
('2026-08-27','CH-1B','CLEAN','챔버 정기 세정',45,'박세정'),
('2026-08-28','CH-2A','CLEAN','챔버 정기 세정',75,'박세정'),
('2026-08-29','CH-2A','ALARM','압력 이상 알람 (자동 복구)',15,'이공정'),
('2026-08-29','CH-2B','CLEAN','챔버 정기 세정',60,'박세정'),
('2026-08-30','CH-3A','CLEAN','챔버 정기 세정',75,'박세정'),
('2026-09-01','CH-1A','RECIPE','공정 레시피 R-14 → R-15',20,'이공정'),
('2026-09-02','CH-3B','ALARM','파티클 모니터 경고',20,''),
]
with open(os.path.join(OUT,'equipment_history_addendum.csv'),'w',newline='') as f:
    w=csv.writer(f); w.writerow(['date','chamber','event_type','detail','duration_min','worker']); w.writerows(eq)
pm=[
('SH2200-B-0412','SH-2200','BSTech','hole_dia_sd',3.0,'2026-07-18',4.8,'2026-08-28',5.1,'um','탈거 후 재측정 (품질팀)'),
('SH2200-B-0413','SH-2200','BSTech','hole_dia_sd',3.0,'2026-07-18',2.7,'2026-08-27',2.7,'um','장착 직전 재확인'),
]
with open(os.path.join(OUT,'part_remeasure.csv'),'w',newline='') as f:
    w=csv.writer(f); w.writerow(['serial','part_no','supplier','spec_item','spec_max','incoming_date','incoming_value','remeasure_date','remeasure_value','unit','note']); w.writerows(pm)
# 요약 (정답지용)
def stats(rs):
    y=[float(r['yield_pct']) for r in rs]; p=[int(r['particle_defects']) for r in rs if r['particle_defects']!='']; d=[int(r['defect_count']) for r in rs]
    return len(rs),st.mean(y),st.stdev(y) if len(y)>1 else 0,st.mean(d),st.mean(p)
clean=[r for r in out[:i_dup+1]+out[i_dup+2:]]
for c in chambers:
    g=[r for r in clean if r['chamber'].upper()==c]
    pre=[r for r in g if r['date'].replace('/','-')<='2026-08-27']; post=[r for r in g if r['date'].replace('/','-')>='2026-08-28']
    print(c,'pre n=%d y=%.3f | post n=%d y=%.3f sd=%.3f def=%.1f part=%.1f'%(stats(pre)[0],stats(pre)[1],*stats(post)))
print('rows written', len(out), 'cells', len(out)*7+len(eq)*6+len(pm)*11)
