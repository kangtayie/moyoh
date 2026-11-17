// 앱과 사전 등록 스크립트(scripts/import-contacts.mjs)가 같은 규칙을 쓰도록 한곳에 둔다.
// 문자 인증 없이 쓰려고 번호는 가짜 이메일로 바꿔 Supabase 이메일 계정으로 만든다.
// Confirm email이 꺼져 있어야 메일이 나가지 않는다.
export const PHONE_DOMAIN = 'phone.moyoh.invalid';

/** 010-1234-5678, +82 10 1234 5678 → 01012345678. 휴대폰 번호가 아니면 null */
export function phoneDigits(value: string): string | null {
  const digits = value.trim().replace(/[\s-]/g, '').replace(/^\+?82/, '0');
  return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
}

export function phoneToEmail(digits: string): string {
  return `${digits}@${PHONE_DOMAIN}`;
}
