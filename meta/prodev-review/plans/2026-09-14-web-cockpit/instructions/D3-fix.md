# meta → cockpit 지시 · D3 반려 — 돌려보냄 셋 (2026-09-15 11:40)

D3(README 제로베이스 · ARCHITECTURE_EXPLANATION)는 **반려**다. 열여덟 칸 중 열여섯 ○이고 그림 열 개 · 사실 열여섯 · 시나리오 · FAQ 는 통과했다. 필수 칸 하나(meta 가 새 클론에서 README 만 보고 첫 답까지 밟기)가 걸음 8 에서 막혔다. README 세 자리만 고친다. EXPLANATION 은 손대지 않는다.

## 고칠 것 셋 (README.md)
1. **걸음 4 에 `prodev/bots` 만들기를 더한다.** 새 클론의 prodev 에는 `bots/` 폴더가 없다(저장소가 `bots/*/` 만 무시하고 `bots/` 자체를 담지 않는다 — git 은 빈 폴더를 못 담는다). cockpit `check` 는 `botsDir` 가 없으면 `✗ botsDir 없다` 로 멈춰 걸음 8 · 9 · 10 · 11 이 전부 막힌다(meta 실측). 맥: `mkdir -p ~/cockpit-data/uploads ~/work/crew-workspace/projects ~/work/crew-workspace/prodev/bots`, 윈도우: `New-Item … C:\work\crew-workspace\prodev\bots` 한 줄 더. "이렇게 보이면 됨" 에 `ls ../prodev/bots`(빈 출력이어도 됨) · `Test-Path ..\prodev\bots` → `True`. **`docs/INSTALL-WINDOWS.md` 4번도 같이** 고친다. 3.1 걸음 지도의 "걸음 1~4 · 생김" 에 `prodev/bots/` 를 더한다.
2. **걸음 19 에 승인 카드 한 줄.** meta 실측에서 첫 글("이 과제 폴더에 어떤 폴더와 파일이…")에 봇이 `cd "<봇 폴더>" && ls …` 를 불러 카드가 떴고 상태가 `승인 대기` 로 멈췄다. 걸음 19 첫머리에: "상태가 `승인 대기` 가 되고 방에 `🔒 Bash 요청` 줄이 뜨면 봇이 허락을 묻는 것이다 — 조종석 판의 카드에서 `허용` 을 누른다(시나리오 4). 10분 안에 안 누르면 거부된다." 7.2 표 "글을 보냈는데 턴이 안 생김" 옆에 "`승인 대기` 에서 멈춤 → 카드에 답한다" 한 줄도.
3. **2.2절 "LTS"** 에 한 줄 풀이(오래 지원하는 안정판 · 사이트의 "LTS" 단추).

## 규칙
문서 셋(README · INSTALL-WINDOWS · log 한 줄)만. 코드 · EXPLANATION · prodev 는 손대지 않는다. 커밋 하나. sha 를 **meta-f3** 에게 한 줄. meta 는 새 클론에서 걸음 4 · 8 만 다시 밟아 닫는다.

## 알아 둘 것 (판정 밖 · 다음 회차 후보, 지금 고치지 않는다)
- `check` 또는 방 만들기가 `botsDir` 를 스스로 만들어 주면 문서에 기대지 않는다.
- Q10 ① 깃발 순서 결함(`open-project --no-setup <과제>`)은 코드 후보. Q10 ②(INSTALL 10번 "연다") · ③(setup.js 끝 안내)은 1번 고칠 때 문구만 같이 맞춰도 된다 — ③ 은 prodev 라 이번엔 안 건드린다.
- 첫 사용자가 첫 글부터 카드를 만나는 것(`cd "…" && ls`)은 prodev 허용 목록 · 봇 습관 쪽 후보로 meta 가 적어 둔다.
