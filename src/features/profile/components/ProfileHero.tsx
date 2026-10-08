import { NEUTRAL_BADGE_CLASS, PROVIDER_META } from '../lib/profileOptions';
import type { MemberProfile } from '../types';

interface ProfileHeroProps {
  profile: MemberProfile;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const secondaryButtonClass = 'flex items-center px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 text-sm font-medium transition-colors border border-gray-200 dark:border-white/10';

// 프로필 사진·이름·로그인 제공자와 수정 버튼
export function ProfileHero({ profile, isEditing, isSaving, onEdit, onSave, onCancel }: ProfileHeroProps) {
  const provider = PROVIDER_META[profile.provider] ?? { label: profile.provider, icon: 'ri-user-line' };

  return (
    <div className="bg-gray-100 dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-gray-200 dark:ring-white/10 overflow-hidden bg-indigo-500/20 flex items-center justify-center">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <i className="ri-user-line text-5xl text-white/80" />
              )}
            </div>
          </div>

          {/* Name / meta */}
          <div className="text-center sm:text-left pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profile.nickname}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${NEUTRAL_BADGE_CLASS} self-center`}>
                <i className={`${provider.icon} text-xs`} />
                {provider.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{profile.email}</p>
            <p className="text-gray-500 text-xs mt-1">가입일 {profile.createdAt}</p>
          </div>

          {/* Edit button (hero 우측 정렬) */}
          <div className="sm:ml-auto">
            {!isEditing ? (
              <button onClick={onEdit} className={`${secondaryButtonClass} gap-2 text-gray-900 dark:text-white`}>
                <i className="ri-edit-line" />
                프로필 수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="ri-save-line" />}
                  저장
                </button>
                <button onClick={onCancel} className={`${secondaryButtonClass} gap-1.5 text-gray-700 dark:text-gray-300`}>
                  <i className="ri-close-line" />
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
