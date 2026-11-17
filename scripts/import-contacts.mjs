// 구글폼 응답 CSV로 사전 등록 계정을 만든다. 아이디와 비밀번호는 둘 다 전화번호(숫자만).
//
//   미리보기(기본, 아무것도 만들지 않음):
//     node --env-file=.env.import scripts/import-contacts.mjs private/주민.csv private/유학생.csv
//   실제 등록:
//     node --env-file=.env.import scripts/import-contacts.mjs private/주민.csv private/유학생.csv --apply
//
// .env.import에는 VITE_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 적는다. 둘 다 git에 올라가지 않는다.
// 이미 있는 번호는 건너뛰므로 다시 돌려도 안전하다.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { phoneDigits, phoneToEmail } from '../src/lib/phone.ts';

// 설문의 활동 분류 → 앱의 활동(src/lib/content.ts). 스포츠 직관은 맞는 활동이 없다
const ACTIVITY_MAP = {
  '동네 맛집': ['seochon', 'euljiro'],
  '시장·로컬': ['gwangjang', 'mangwon'],
  '러닝·산책': ['naksan', 'namhansan'],
  '전시·박물관': ['museum'],
  '요리·공예': ['bukchon-craft'],
  '지역 여행': ['suwon', 'dumulmeori', 'incheon-port'],
  '그냥 대화': ['seochon'],
};

/** 따옴표 안의 줄바꿈까지 처리하는 CSV 읽기 */
function parseCsv(text) {
  const rows = [[]];
  let cell = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { rows.at(-1).push(cell); cell = ''; }
    else if (ch === '\n') { rows.at(-1).push(cell.replace(/\r$/, '')); cell = ''; rows.push([]); }
    else cell += ch;
  }
  rows.at(-1).push(cell);
  return rows.filter((r) => r.some((c) => c.trim()));
}

const mask = (d) => `${d.slice(0, 3)}-****-${d.slice(-4)}`;

function readSurvey(path) {
  const [header, ...rows] = parseCsv(fs.readFileSync(path, 'utf8'));
  const col = (word) => header.findIndex((h) => h.includes(word));
  const phoneCol = col('전화번호');
  if (phoneCol < 0) throw new Error(`${path}: 전화번호 열을 찾지 못했어요`);
  const topikCol = col('TOPIK 급수');
  const role = topikCol >= 0 ? 'foreigner' : 'local';
  const betaCol = col('베타 테스트');
  const regionCol = col('거주 지역');
  const activityCol = header.findIndex((h) => h.includes('함께 해보고 싶은 활동'));

  const people = [];
  const skipped = { noPhone: 0, invalid: 0, declined: 0 };
  for (const r of rows) {
    const raw = (r[phoneCol] ?? '').trim();
    if (!raw) { skipped.noPhone++; continue; }
    const phone = phoneDigits(raw);
    if (!phone) { skipped.invalid++; continue; }
    // 베타 테스트 참여를 거절한 사람은 계정을 만들지 않는다
    if (betaCol >= 0 && r[betaCol]?.trim() === '아니오') { skipped.declined++; continue; }
    const meta = { preregistered: true, role };
    if (role === 'foreigner') {
      const level = Number.parseInt(r[topikCol] ?? '', 10);
      meta.topik_level = level >= 1 && level <= 6 ? level : null;
    } else {
      meta.region = regionCol >= 0 ? r[regionCol]?.trim() || null : null;
      const picked = activityCol >= 0 ? r[activityCol] ?? '' : '';
      meta.activities = [...new Set(Object.entries(ACTIVITY_MAP).flatMap(([k, ids]) => (picked.includes(k) ? ids : [])))];
    }
    people.push({ phone, meta });
  }
  return { path, role, total: rows.length, people, skipped };
}

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('CSV 파일을 하나 이상 지정해 주세요.');
  process.exit(1);
}

const byPhone = new Map();
for (const f of files) {
  const s = readSurvey(f);
  console.log(`${f} (${s.role === 'local' ? '주민' : '유학생'}): 응답 ${s.total}건 → 등록 대상 ${s.people.length}명`);
  console.log(`  제외: 번호 없음 ${s.skipped.noPhone}, 휴대폰 번호 아님 ${s.skipped.invalid}, 베타 테스트 거절 ${s.skipped.declined}`);
  for (const p of s.people) {
    if (byPhone.has(p.phone)) console.log(`  중복 번호 건너뜀: ${mask(p.phone)}`);
    else byPhone.set(p.phone, p);
  }
}
console.log(`합계 ${byPhone.size}명`);

if (!apply) {
  console.log('미리보기만 했어요. 실제로 만들려면 --apply를 붙여 다시 실행하세요.');
  process.exit(0);
}

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('.env.import에 VITE_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요해요.');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let created = 0;
let existed = 0;
let failed = 0;
for (const { phone, meta } of byPhone.values()) {
  const { error } = await sb.auth.admin.createUser({
    email: phoneToEmail(phone),
    password: phone,
    email_confirm: true,
    user_metadata: meta,
  });
  if (!error) created++;
  else if (/already/i.test(error.message)) existed++;
  else { failed++; console.error(`실패 ${mask(phone)}: ${error.message}`); }
}
console.log(`완료: 새로 만듦 ${created}, 이미 있음 ${existed}, 실패 ${failed}`);
process.exit(failed ? 1 : 0);
