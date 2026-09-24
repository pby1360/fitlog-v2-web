import { Link } from 'react-router-dom';
import LegalLayout, { Section } from './LegalLayout';

/*
 * 이용약관 (초안)
 * [대괄호] 항목은 운영 주체가 채워야 하며, 공개 전 법률 검토가 필요하다.
 */
export default function TermsPage() {
  return (
    <LegalLayout title="이용약관" effectiveDate="[시행일 YYYY-MM-DD]">
      <Section title="제1조 (목적)">
        <p>이 약관은 [운영자명](이하 "운영자")이 제공하는 Fitlog(이하 "서비스")의 이용 조건과 절차를 정합니다.</p>
      </Section>

      <Section title="제2조 (서비스 내용)">
        <p>서비스는 운동 프로그램 작성, 운동 진행 기록, 기록 조회와 통계 기능을 무료로 제공합니다.</p>
      </Section>

      <Section title="제3조 (가입과 계정)">
        <ul className="list-disc pl-5 space-y-1">
          <li>Google 또는 카카오 계정으로 로그인하면 가입됩니다.</li>
          <li>같은 이메일이라도 로그인 공급자가 다르면 별도 계정이 아니라 기존 가입 공급자로 로그인해야 합니다.</li>
          <li>계정은 본인만 이용해야 하며, 타인에게 양도할 수 없습니다.</li>
        </ul>
      </Section>

      <Section title="제4조 (이용자의 의무)">
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스를 정상적으로 이용하지 않는 방법(자동화된 대량 요청, 다른 사람의 데이터 접근 시도 등)을 사용해서는 안 됩니다.</li>
          <li>메모 등에 타인의 개인정보나 불법 정보를 입력해서는 안 됩니다.</li>
        </ul>
      </Section>

      <Section title="제5조 (건강 관련 고지)">
        <p>
          서비스는 운동을 기록하는 도구이며 의학적 조언이나 운동 처방을 제공하지 않습니다.
          운동 강도와 방법은 본인의 건강 상태에 맞게 판단해야 합니다.
        </p>
      </Section>

      <Section title="제6조 (서비스 변경과 중단)">
        <p>
          운영자는 운영상·기술상 필요에 따라 서비스를 변경하거나 중단할 수 있으며, 중요한 변경은 사전에 서비스 화면으로 알립니다.
          서비스를 종료하는 경우 이용자가 기록을 확인할 수 있도록 [기간] 전에 알립니다.
        </p>
      </Section>

      <Section title="제7조 (탈퇴)">
        <p>
          이용자는 언제든지 [프로필 &gt; 계정 삭제]로 탈퇴할 수 있으며, 탈퇴 시 데이터는{' '}
          <Link to="/privacy" className="underline">개인정보처리방침</Link>에 따라 파기됩니다.
        </p>
      </Section>

      <Section title="제8조 (책임의 제한)">
        <p>
          운영자는 천재지변, 외부 서비스(로그인 공급자, 클라우드 인프라) 장애 등 운영자가 통제할 수 없는 사유로 발생한 손해에 대해 책임을 지지 않습니다.
          다만 운영자의 고의 또는 중대한 과실로 인한 손해는 예외로 합니다.
        </p>
      </Section>

      <Section title="제9조 (문의 및 분쟁)">
        <p>서비스 이용 문의는 [이메일 주소]로 할 수 있습니다. 이 약관은 대한민국 법률에 따릅니다.</p>
      </Section>
    </LegalLayout>
  );
}
