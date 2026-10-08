import { useState } from 'react';
import {
  AccountCard,
  DeleteAccountDialog,
  PersonalInfoCard,
  ProfileHero,
  ProfileStats,
  useProfile,
} from '@/features/profile';
import { Spinner } from '@/shared/ui/Spinner';

export default function ProfilePage() {
  const profile = useProfile();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (profile.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-gray-600 dark:text-gray-400 text-sm">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (profile.error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-2xl text-red-400" />
        </div>
        <p className="text-gray-900 dark:text-white font-medium mb-1">불러오기 실패</p>
        <p className="text-red-400 text-sm">{profile.error}</p>
      </div>
    );
  }

  if (!profile.profile) return null;

  return (
    <>
      <ProfileHero
        profile={profile.profile}
        isEditing={profile.isEditing}
        isSaving={profile.isSaving}
        onEdit={profile.startEdit}
        onSave={profile.save}
        onCancel={profile.cancelEdit}
      />
      <ProfileStats profile={profile.profile} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-5">
        <PersonalInfoCard
          profile={profile.profile}
          isEditing={profile.isEditing}
          editData={profile.editData}
          saveError={profile.saveError}
          onChange={profile.changeField}
        />
        <AccountCard
          onDeleteAccount={() => {
            profile.clearDeleteError();
            setShowDeleteModal(true);
          }}
        />
      </div>

      {showDeleteModal && (
        <DeleteAccountDialog
          isDeleting={profile.isDeleting}
          error={profile.deleteError}
          onConfirm={profile.deleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
