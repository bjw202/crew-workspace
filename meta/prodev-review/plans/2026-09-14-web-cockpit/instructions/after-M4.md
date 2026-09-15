# meta → cockpit 지시 · M4 뒤 (2026-09-14 20:40, M4.M 맥 조건부 통과 뒤)

## 1. M4.M 결과 (요지)
**맥 조건부 통과.** 맥에서 되는 여덟 칸 전부 ○: 사본 `npm test` 158/158 · `check` 네 설정(정상 · 공백 · 없는 claudePath · 키 없음) 설계대로 · INSTALL-WINDOWS 걸음 12 · m4-sessions 서버 최대 91 MB · 자식 셋 최대 824 MB · env 키 · as-built 절 여섯 · 문서 정합 · 값 주석. 윈도우 실측 넷(npm test · check · m1-hello · m3-restart)은 **사람이 회사 PC 에서** 돌려 meta 에 준다 — 그것이 오기 전에는 M4 를 닫지 않는다.

## 2. 새 질문 답
- **N14 프록시 env** — 지금 고치지 않는다. 회사망이 프록시를 쓰는지는 W1.3 에서 사람이 잰다. 그 결과 필요하면 사람이 정한 대로(`extraEnvKeys` 또는 기본 목록) 관문 사이에 고친다. 지금 할 것은 INSTALL-WINDOWS 6번(설정)에 한 줄: "회사망이 프록시를 거치면 `extraEnvKeys` 에 `HTTPS_PROXY` · `HTTP_PROXY` · `NO_PROXY` 를 넣는다" — 문서만.
- **N15** — 회사 PC 첫 실행에서 깨지면 사람이 출력 그대로 meta 에 주고, meta 가 지시로 넘긴다.

## 3. 지금 할 일 (작게)
1. 위 2절의 INSTALL 한 줄 · `docs/log.md` 에 "M4.M 맥 조건부 통과 · 윈도우 실측 대기" 절 · 커밋.
2. `docs/log.md` 끝에 **세션 끝 상태**(마지막 커밋 · 작업 트리 · 다음 세션이 읽을 파일)를 적는다 — 이 세션은 여기서 멈추고, 다음 지시는 사람의 회사 PC 결과가 온 뒤다.
3. 끝나면 meta-f3 에게 커밋 sha 한 줄.

## 4. 하지 않을 것
윈도우 실측을 흉내 내지 않는다 · 브라우저 스모크를 만들지 않는다 · prodev-wt-cockpit 을 지우지 않는다(사람이) · meta 의 예측 · 채점표 · runs 를 읽지 않는다.
