# C-끝 관문 판정 — 전체 렌더

판정한 때: 2026-09-15 18:05. 채점표 `2026-09-15-C-build-scoring.md` C-끝. meta 가 직접 ffprobe · cmp · grep 을 돌렸다.

## 판정: **통과** → 사람 시사로

| # | 칸 | 결과 | 근거 (meta 가 직접) |
|---|---|---|---|
| **1** | mp4 총 프레임 9,990 · 30fps · 1920x1080 | ✓ | `ffprobe`: nb_read_frames=9990 · 1920×1080 · 30/1. 파일 24,768,672 바이트 · `out/main.mp4` (18:03) |
| 2 | Main = 장면 Composition (S01 · S07 · S14) | ✓ | S01 은 C-1 때 cmp 같음. `check-4020.png` = `check-S07-0.png` · `check-9660.png` = `check-S14-300.png` (cmp 같음) |
| 3 | 사람 시사 | 대기 | 아래 "시사에서 정할 것" |
| — | 렌더 경고 | 0 | `out/render-main.log` warn/error 0 |
| — | index.ts 합 | ✓ | `TOTAL_FRAMES = 9990`, `!==` 면 throw |

## 관문 요약 (A → B → C)

| 관문 | 판정 | 기록 |
|---|---|---|
| A 기획 | 통과 (1차) · 2판 덧붙임 | `2026-09-15-A-plan.md` |
| B 콘티 | 1차 반려(용어) → 2차 통과 | `2026-09-15-B-storyboard.md` |
| C-0 무대 | 통과 (상수 셋) | `2026-09-15-C0-stage.md` |
| C-1~3 | 통과 (상수 둘) | `2026-09-15-C1-3-scenes.md` |
| C-4 ~ C-12 | 통과 (장면마다 값 1~3) | `2026-09-15-C4-scene.md` … `C12-scene.md` |
| C-13 · C-14 | 통과 (고침 없음) | `C13-scene.md` · `C14-scene.md` |
| C-끝 | 통과 | 이 파일 |

## 시사에서 사람이 정할 것

1. **마무리 자막 길이** — 장면 14 끝 요지 자막 두 줄, 485~625 (140프레임 = 4.7초). 짧으면 장면 14 를 더 늘린다.
2. **`🔒 Bash 요청 · curl --version`** (장면 7) — `·` 뒤는 SDK 가 주는 title 이라 실제 화면과 다를 수 있다 (`relay.js:32`). 실제와 맞추려면 `🔒 Bash 요청 · Bash`.
3. **전체 속도** — 5분 33초. 장면 6(32초) · 8(32초)이 가장 길다.

## 사람 시사 1차 (2026-09-15)

사람이 둘을 짚었다. `05-next.md` 에 고침을 적어 remotion 세션에 보냈다.
1. 장면 5 의 `MINIDISCORD_DB` — 이제 안 쓰는 이름. 화면에서 뺀다. (코드 `prodev/common/settings.template.json:8` 에는 이름이 남아 있고 값은 chat.db 경로다. **이름 바꾸기는 prodev PR 거리** — `PRODEV_CHAT_DB` 같은 것. `places.js` · `pre-reply.js` · `setup.js` 가 같이 바뀌어야 한다.)
2. 장면 2 의 chat.db · cockpit.db 역할 설명 보충 — 원통 아래 역할 이름표 둘과 "봇은 chat.db 만 읽기, cockpit.db 는 deny" 한 줄.

### 시사 1차 고침 뒤 재렌더 (22:35) — **통과**

- S05-0350: `env: PRODEV_BOT · PRODEV_PROJECT` 한 줄 (MINIDISCORD_DB 없음). S06 · S07 의 이어진 줄도 같이 고침 (`grep MINIDISCORD src/` 0건).
- S02-0520: 역할 이름표 둘이 기둥 밖 아래(y 622)에 두 줄씩(낱말 단위), 셋째 줄 y 672. meta 가 열어 확인.
- `out/main.mp4` 22:35 · ffprobe nb_read_frames=9990 · 1920×1080 · 30/1 · 24,795,857 바이트 · 렌더 122초 · 로그 warn/error 0 (meta 가 직접 ffprobe · grep).

## 아직 안 한 것

- **커밋.** `remotion/` 전체가 미추적이다 (`git status`: `?? remotion/`). `out/` · `node_modules/` 는 .gitignore 에 있다. 사람이 시사한 뒤 정한다.
- `_Demo.tsx` · `_Parts.tsx` 확인용 Composition 은 남겨 두었다 (04 5절 규칙 8).
