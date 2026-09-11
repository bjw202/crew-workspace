// db-scrub.js — 공개 저장소에 올리는 fixture 채팅 DB 에서 토큰을 지운다: bots.token 을 자리표시로, sessions 전부 삭제. 대화·카드·첨부 행은 그대로.
// 쓰는 법: node db-scrub.js <fixture.db>   (2026-09-11 공개 전환 때 살아 있는 토큰이 fixture 에 들어 있던 것을 지운 도구. fixture 를 새로 뜰 때마다 돌린다)
const { DatabaseSync } = require('node:sqlite');
const f = process.argv[2];
const db = new DatabaseSync(f);
const before = { bots: db.prepare('select count(*) c from bots where length(token) > 20').get().c, sessions: db.prepare('select count(*) c from sessions').get().c };
db.exec("UPDATE bots SET token = 'fixture-token-' || id");
db.exec('DELETE FROM sessions');
db.exec('VACUUM');
const after = { bots: db.prepare('select count(*) c from bots where length(token) > 20').get().c, sessions: db.prepare('select count(*) c from sessions').get().c, messages: db.prepare('select count(*) c from messages').get().c };
db.close();
console.log(f, '· 긴 토큰 봇', before.bots, '→', after.bots, '· 세션', before.sessions, '→', after.sessions, '· 메시지', after.messages);
