import { Link } from 'react-router-dom';
import { Modal } from '@/shared/ui/Modal';
import { ProfileCard } from './ProfileCard';

// 계정 설정: 개인정보 안내와 탈퇴 버튼
export function AccountCard({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <ProfileCard icon="ri-settings-3-line" title="계정 설정">
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        <div className="px-6 py-4 text-xs text-gray-500 space-y-1">
          <p>키·몸무게·운동 목표·경력은 선택 입력 항목이며 프로필 표시에만 사용됩니다. 비워 두면 저장된 값이 삭제됩니다.</p>
          <p>
            자세한 내용은 <Link to="/privacy" className="underline">개인정보처리방침</Link>을 확인하세요.
          </p>
        </div>
        <div className="px-6 py-4">
          <button
            onClick={onDeleteAccount}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            <i className="ri-delete-bin-line" />
            계정 삭제
          </button>
        </div>
      </div>
    </ProfileCard>
  );
}

interface DeleteAccountDialogProps {
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountDialog({ isDeleting, error, onConfirm, onCancel }: DeleteAccountDialogProps) {
  return (
    <Modal
      overlayClassName="bg-black/30 dark:bg-black/50"
      className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-xl p-6 w-full max-w-md"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">계정을 삭제할까요?</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        프로필, 운동 프로그램, 운동 기록, 직접 만든 운동이 모두 즉시 삭제되며 되돌릴 수 없습니다.
      </p>
      <p className="text-xs text-gray-500 mb-5">모든 기기에서 로그아웃됩니다.</p>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white disabled:opacity-50"
        >
          {isDeleting ? '삭제 중...' : '영구 삭제'}
        </button>
      </div>
    </Modal>
  );
}
