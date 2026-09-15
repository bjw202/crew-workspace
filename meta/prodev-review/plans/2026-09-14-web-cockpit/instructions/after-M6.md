# meta → cockpit 지시 · M6 뒤 마무리 (2026-09-15 01:55, M6.M 통과 뒤)

## 1. M6.M 결과 (요지)
**통과 8/8.** N17(도구 요약 한 줄 · 줄임표 · 펼침) · N16(etag · 304, meta 가 `~/cockpit-try-v2` 를 M6 판으로 다시 띄워 `curl -I` 로 실측) · INSTALL v2 · README v2 · 스모크 둘 · as-built. **prodev PR #20 은 이미 머지됐다**(`8f0870b`, 사람이 meta 검수 전에 머지해 meta 가 사후 검수로 통과시켰다). 본 체크아웃 `../prodev` 도 `8f0870b` 다 — 이제 worktree 새 가지는 `origin/main`(= 8f0870b) 기준.

## 2. 새 질문 답
- **Q5** — 사람이 `~/cockpit-try-v2`(M6 판)에서 보통 새로고침만으로 새 도구 요약이 보이는지 본다. 결과는 meta 가 기록한다. cockpit 이 할 일 없음.
- **Q6** — **고친다.** `intake/SKILL.md:88` 의 저장소 기준 경로(`design/v2/ARCHITECTURE.md`)를 지우고, 그 줄이 전하려던 규칙을 스킬 본문 한 줄로 옮긴다. 스킬은 저장소 문서를 가리키지 않는다(과제 폴더의 봇은 그 문서를 못 열고, 찾느라 `grep` · `find` 로 과제 밖을 뒤져 승인 카드를 만든다 — R2 · 시험 봇에서 실측). 시험 한 건: `.claude/skills/**` 에 `design/v[0-9]/` 문자열 0.
- **Q7** — 설치 걸음에는 안 넣는다(회사 PC 는 새 클론). 대신 INSTALL 끝에 **"판 올리기"** 절 하나: `git pull --ff-only`(cockpit · prodev 둘) → `npm ci` → serve 다시 띄우기(Ctrl-C 뒤 같은 명령, 세션은 resume) → 브라우저는 보통 새로고침(etag). prodev 를 올린 뒤 봇 폴더 설정을 다시 쓰려면 `setup.js` 를 다시 돌리면 `settings.local.json` 이 덮인다는 것(ADR-038)도 한 줄.

## 3. 할 일 (작게 · 마지막)
1. prodev PR(#21 후보): Q6 한 줄 + 시험 한 건. worktree `../prodev-wt-cockpit-v2` 에 `origin/main` 기준 새 가지 `cockpit-v2c`. PR 본문에 R2 · 시험 봇에서 본 `find`/`grep` 승인 카드 사례 한 줄. **머지는 사람 — meta 검수 뒤.**
2. INSTALL "판 올리기" 절(Q7) · README 한 줄.
3. `docs/log.md` 끝에 세션 끝 상태. 커밋 sha 들을 **meta-f3** 에게 한 줄. 그 뒤 **멈춘다** — 다음 지시는 사람의 회사 PC 실증(W1) 결과가 온 뒤다.

## 4. 규칙 (같음)
원본 구간 무변경 · `npm test` 무의존 · 본 체크아웃 읽기만 · meta 의 예측 · 채점표 · runs 안 읽음.
