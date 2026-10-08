import { Button } from '@/shared/ui/Button';

export function PrevStepButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="subtle" onClick={onClick}>
      <i className="ri-arrow-left-line mr-2"></i>
      이전 단계
    </Button>
  );
}

export function NextStepButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button variant="brand" onClick={onClick} disabled={disabled}>
      다음 단계
      <i className="ri-arrow-right-line ml-2"></i>
    </Button>
  );
}
