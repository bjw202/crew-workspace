# meta — 사람이 읽는 안내

이 폴더는 **재고 검수하는 자리**입니다. 만들지 않습니다.
시험 문제를 낸 사람이 자기 답안지를 채점하면 채점이 무너지므로, 만드는 자리와 재는 자리를 나눴습니다.

    crew-workspace/
      ├── prodev/       ← 지금 만드는 것 (비서 봇 하나). meta 는 관문 사이에 worktree + PR 로만 고침
      ├── meta/         ← 여기. 예측 · 시험 자료 · 검수 기록
      ├── crew/         ← 앞선 실험 (봇 다섯, 닫힘). 부품을 가져다 씀
      ├── rooms/ knowledge/ minidiscord/

## 폴더

| 폴더 | 무엇 |
|---|---|
| `prodev-review/plans/` | prodev 의 기획 · 상세 설계 · 검토 결과 · 시제품(`proto/chat.js`) |
| `prodev-review/predictions/` | 제작 **전에** 적는 예측 (숫자) |
| `prodev-review/fixtures/` | 시험 자료 · 정답지 · 채점표. prodev 세션에는 입력만 준다 |
| `prodev-review/scripts/` | 대본 (사람 역할을 API 로 재생) |
| `prodev-review/runs/` | 관문마다 검수 기록 |
| `prodev-review/notes/` | prodev 관련 바깥 근거 (고영혁 사례 분석) |
| `crew-eval/` | crew 실험의 기록 전부. INTENT · notes(예측·결과·정답지) · 대조군 · 자료 · 옛 안내(`README-crew-era.md`) |
| `user-notes/` | 사람이 준 자료 |

## 세션 여는 법

    cd <작업판>/crew-workspace/meta      # 작업판을 받은 자리. 회사에서는 그 기계의 경로
    claude

`.claude/settings.json` 이 형제 폴더 다섯(prodev · crew · rooms · knowledge · minidiscord)을 읽을 수 있게 열어 두고, `prodev` · `crew` · `minidiscord` 의 **본 체크아웃**에 쓰는 것은 막습니다(훅 `.claude/hooks/guard.js`). 고칠 때는 crew 때처럼 worktree(`../prodev-wt-<이름>/`)를 떠서 PR 로 올립니다. 관문이 진행 중일 때는 `prodev-review/runs/IN-PROGRESS` 파일을 두어 worktree 까지 막습니다. 검수가 끝나면 그 파일을 지웁니다. 세션이 막히면 그것은 규칙이 작동한 것입니다.

prodev 세션은 meta 의 `CLAUDE.md` 를 읽지 않습니다. 형제 폴더라서 새지 않습니다. 이것이 "meta 가 prodev 에 영향을 주지 않는다"의 뜻입니다.

## 한 바퀴 — prodev 관문마다

    ① prodev 세션이 "끝났다"고 알린다 (돌려 볼 명령과 함께)   ← prodev
    ② meta 가 직접 돌린다 (npm test · 점검 모드 · 대본 재생)     ← 세션
    ③ 표를 채우고 runs/ 에 남긴다                               ← 세션
    ④ 통과면 다음 단계, 반려면 빗나간 줄만 알린다               ← 세션
    ⑤ prodev 가 고친다                                          ← prodev

관문의 순서와 기준은 `../prodev/TASKS.md` 와 `../prodev/VERIFICATION.md` 에 있습니다. meta 는 그 표를 채우는 쪽입니다.

## 세션이 지켜야 할 규칙은 `CLAUDE.md` 에 있습니다

이 README 는 사람이 읽는 것이고, `CLAUDE.md` 는 세션이 매번 읽는 것입니다. crew 시절의 절차(봇 재시작 · PR 머지 · 막힐 때)는 `crew-eval/README-crew-era.md` 에 그대로 있습니다.
