import LegalLayout, { Section } from './LegalLayout';

/*
 * 개인정보처리방침 (초안)
 * 실제 코드의 데이터 흐름(2026-09 기준)을 바탕으로 작성했다.
 * [대괄호] 항목은 운영 주체가 채워야 하며, 공개 전 법률 검토가 필요하다.
 * 수집 항목·보관 위치가 바뀌면 이 문서도 함께 수정한다.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="개인정보처리방침" effectiveDate="[시행일 YYYY-MM-DD]">
      <p>
        [운영자명](이하 "운영자")은 Fitlog(이하 "서비스") 이용자의 개인정보를 「개인정보 보호법」에 따라 처리하며,
        처리 목적에 필요한 최소한의 정보만 수집합니다.
      </p>

      <Section title="1. 처리하는 개인정보 항목">
        <p><strong>소셜 로그인 시 공급자로부터 받는 정보 (필수)</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google: 계정 식별자, 이메일, 이름, 프로필 사진</li>
          <li>카카오: 회원번호, 닉네임, 프로필 사진 (이메일은 받지 않으며, 내부 식별용 대체 값을 생성합니다)</li>
        </ul>
        <p><strong>이용자가 직접 입력하는 정보 (선택)</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>닉네임, 키, 몸무게, 운동 목표, 운동 경력</li>
        </ul>
        <p><strong>서비스 이용 과정에서 생성되는 정보</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>운동 프로그램, 운동 기록(종목, 세트, 무게, 횟수, 메모, 운동 시각), 직접 만든 운동 종목·부위</li>
          <li>로그인 세션 정보(암호화된 토큰 값, 생성·사용 시각)</li>
          <li>서버 접속 기록(IP 주소, 요청 경로, 시각)</li>
        </ul>
        <p>
          키·몸무게는 운동 기록과 함께 저장되지만 건강 상태를 판단하는 데 사용하지 않으며, 입력하지 않아도 서비스를 이용할 수 있습니다.
        </p>
      </Section>

      <Section title="2. 처리 목적">
        <ul className="list-disc pl-5 space-y-1">
          <li>회원 식별과 로그인 유지</li>
          <li>운동 프로그램 관리, 운동 기록 저장과 통계 제공</li>
          <li>프로필 표시 (선택 입력 항목)</li>
          <li>부정 이용 방지와 장애 대응 (접속 기록)</li>
        </ul>
      </Section>

      <Section title="3. 보유 및 파기">
        <p>
          회원 탈퇴 시 프로필, 운동 프로그램, 운동 기록, 직접 만든 운동, 로그인 세션을 지체 없이 파기합니다.
          탈퇴는 [프로필 &gt; 계정 삭제]에서 직접 할 수 있습니다.
        </p>
        <p>
          다만 서버 접속 기록은 [보존 기간]간, 데이터베이스 백업에는 [백업 보존 기간]간 남아 있을 수 있으며 기간이 지나면 삭제됩니다.
          관계 법령에 따라 보존해야 하는 정보가 있으면 해당 기간 동안 분리해 보관합니다.
        </p>
      </Section>

      <Section title="4. 처리 위탁 및 국외 이전">
        <p>서비스 운영을 위해 아래 업체의 인프라를 이용합니다. [계약·이전 국가 확인 필요]</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Supabase: 데이터베이스 보관 [리전: 서울(ap-northeast-2) 확인 필요]</li>
          <li>Google Cloud: 서버 운영 및 접속 기록 보관 [리전: 서울(asia-northeast3) 확인 필요]</li>
          <li>Firebase Hosting(Google): 웹 페이지 전송</li>
          <li>Google, 카카오: 소셜 로그인</li>
        </ul>
      </Section>

      <Section title="5. 브라우저에 저장하는 정보">
        <p>
          로그인 유지를 위한 토큰, 프로필 사진 주소, 화면 설정, 진행 중인 운동 상태를 브라우저 저장소(localStorage)에 저장합니다.
          로그아웃하면 로그인 정보가 삭제되며, 브라우저 설정에서 직접 지울 수도 있습니다.
        </p>
      </Section>

      <Section title="6. 이용자의 권리">
        <p>
          이용자는 언제든지 프로필에서 자신의 정보를 조회·수정하고, 계정 삭제로 처리 정지와 파기를 요청할 수 있습니다.
          그 밖의 요청은 아래 문의처로 연락하면 지체 없이 처리합니다.
        </p>
      </Section>

      <Section title="7. 만 14세 미만 아동">
        <p>[운영 정책 확인 필요] 서비스는 만 14세 미만 아동의 가입을 받지 않습니다.</p>
      </Section>

      <Section title="8. 개인정보 보호책임자 및 문의">
        <ul className="list-disc pl-5 space-y-1">
          <li>책임자: [이름]</li>
          <li>문의: [이메일 주소]</li>
        </ul>
      </Section>

      <Section title="9. 방침 변경">
        <p>이 방침이 바뀌면 시행 7일 전부터 서비스 화면을 통해 알립니다.</p>
      </Section>
    </LegalLayout>
  );
}
