# 공개 전환 점검 — 비밀 · 개인정보 · 회사 자료 (2026-09-11)

사람이 저장소 넷(crew-workspace · prodev · minidiscord · crew)을 public 으로 바꾸고 점검을 시켰다. 추적된 파일만 봤다(`git ls-files`). 지시받은 범위: 권한 것(토큰) + 계정 이름이 든 경로. 판단은 사람 몫으로 남긴 것은 4절.

## 1. 찾은 것

| 무엇 | 어디 | 크기 |
|---|---|---|
| **살아 있는 토큰이 든 DB** — `bots.token` 5(옛 crew 봇) · `sessions.token` 30, 로컬 서버 DB(`minidiscord/server/data`)와 **같은 값** | `meta/prodev-review/fixtures/chat/minidiscord.db` · `prodev/test/fixtures/chat/minidiscord.db` | 고칠 것. 서버는 `127.0.0.1` 바인딩(`server/src/config.ts`)이라 실해는 없었다 |
| 계정 이름(`byunjungwon`)이 든 절대 경로 | crew-workspace 추적 글 파일 13 · 옛 방 압축본 안 파일 10 · minidiscord 개발 스크린샷 31장 | 개인정보(실명에 가까운 손잡이) |
| 토큰 · 키 · 쿠키 꼴 (`md_session=` `TOKEN=` `sk-` `ghp_` 개인키) | 추적 파일 글 속 | **0건** |
| 이메일 · 전화번호 | 〃 | **0건** (csv 의 숫자 둘은 챔버 데이터) |
| `.env` · `*.tokens.env` · 살아 있는 DB | 추적 여부 | 추적 안 됨 (`.gitignore`). 문제는 fixture DB 에 둔 **예외** 둘이었다 |
| 회사 자료 | `projects/` · `user-notes/` gitignore · `knowledge/` 원격 없음 | 새지 않음. 대화·카드·시나리오는 전부 가상 |

## 2. 한 것

| # | 무엇 | 어떻게 | 확인 |
|---|---|---|---|
| 1 | 로컬 서버에서 옛 토큰을 죽였다 | 서버를 잠깐 띄워 **API 로** — `DELETE /api/bots/{1..5}` (analyst · archivist · orchestrator · reporter · researcher) · `POST /api/auth/logout` 를 세션 52개 전부에 · 서버 끔. DB 를 직접 쓰지 않았다 | 새 사본에서 봇 5(prodev 것들 · 점검봇) · **세션 0** |
| 2 | meta 의 fixture DB 둘에서 토큰을 지웠다 | `scripts/tools/db-scrub.js` (새 도구) — `bots.token` → `fixture-token-<id>` · `sessions` 삭제 · VACUUM. 대화 377건 그대로 | `dbcheck` 로 긴 토큰 0 · 세션 0 |
| 3 | prodev 의 같은 fixture 는 PR 로 | prodev 세션에 meta 사본으로 교체하라고 청함 → **PR #14 `df2373a`** (파일 셋: fixture DB · `test/fixtures/README.md` 절 · `docs/log.md`) | **sha256 `07074113…` 로 meta 사본과 같음 · 토큰 꼴 지움×5 · 세션 0 · 시험 133 · 25 실패 0** (`-fixture-scrub-tests.txt`) |
| 4 | 이력은 다시 쓰지 않았다 | 1번으로 옛 값이 죽었으므로 이력의 값은 쓸모없다. 두 저장소 다 그 파일은 커밋 한 번뿐이라 원하면 `git filter-repo` 로 걷어낼 수 있다 | — |
| 5 | 계정 이름 경로를 지웠다 | 글 파일 10: `/Users/<계정>/…/crew-workspace` → `<작업판>`, 스크래치 경로 → `<작업판-meta>` · 옛 스크립트 둘(`measure.js` · `rule-cost.js`)은 `__dirname` 기준 상대 경로로 · `meta/.claude/settings.json` 은 `../prodev` 꼴 상대 경로와 `Edit(/../prodev/**)` 꼴로 | 추적 파일 grep **0** |
| 6 | 옛 방 압축본을 다시 쌌다 | 안쪽 파일 10곳의 경로를 지우고 **안쪽 `.git/` 을 뺐다**(그 안 객체에도 경로가 있어서). 2.4MB → 480KB · 1296 → 155 파일. 옛 압축본은 이 저장소 이력에 남아 있다 | `tar -xzO \| grep` **0** |
| 7 | 다시 새지 않게 | `.gitignore` 예외 줄에 "올리기 전에 `db-scrub.js`" · `fixtures/README.md` 에 토큰 지운 것임을 적음 | — |

## 3. 손대지 않은 것 (범위 밖 · 사람 판단)

- **minidiscord 의 개발 스크린샷 31장**(`.moai/specs/_archive/SPEC-LIVEVERIFY-001/evidence/*.png`) — 터미널 경로에 계정 이름, 만료된 승인 코드가 보인다. minidiscord 는 meta 가 고치지 않는 저장소라 그쪽 세션에서 지운다.
- **실존 인물 분석 노트** `notes/external-evidence-gonnector.md` — 공개 인터뷰 근거, 원자료는 저장소 밖. 특정인 방식을 평가한 글이 공개된 것은 사람 판단.
- **커밋 메시지의 Claude 세션 링크** 85개 — 본인 계정으로만 열리는 링크. 비밀 아님.
- `meta/.claude/settings.json` 을 상대 경로로 바꾼 것은 **세션을 다시 켜야 반영**된다. `additionalDirectories` 가 상대 경로로 풀리지 않으면 형제 폴더 읽기가 막힐 수 있다 — 그때는 절대 경로로 되돌리되 계정 이름을 감출 수는 없다(훅 `guard.js` 가 쓰기를 막는 것은 경로와 무관하게 그대로다).

## 4. 그 밖에 본 것

- 로그아웃은 세션 **전부**였으므로 브라우저에서 minidiscord 에 다시 로그인해야 한다(비밀번호 없음).
- prodev 봇들의 토큰(`prodev-*` 다섯)은 fixture 에 없었고 건드리지 않았다.
- 서버 세션에는 만료가 없다(`auth.ts`). 공개 fixture 에 세션 토큰이 들어가면 영구히 산다는 뜻이라, `db-scrub.js` 를 fixture 뜰 때마다 돌린다.
