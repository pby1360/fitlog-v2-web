import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearLocalData } from '@/shared/lib/authStorage';
import { deleteMyAccount, getMyProfile, updateMyProfile } from '../api';
import { profileToEditData, type EditData } from '../lib/profileOptions';
import type { MemberProfile } from '../types';

const EMPTY_EDIT_DATA: EditData = { nickname: '', height: '', weight: '', goal: '', experience: '' };

// 내 프로필 조회·수정·탈퇴
export function useProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>(EMPTY_EDIT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setEditData(profileToEditData(data));
      })
      .catch((err) => setError(err instanceof Error ? err.message : '프로필을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    if (profile) setEditData(profileToEditData(profile));
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    if (profile) setEditData(profileToEditData(profile));
  };

  const changeField = (field: keyof EditData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // 키·몸무게를 비우면 null 로 보내 저장된 값을 지운다
  const save = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const updated = await updateMyProfile({
        nickname: editData.nickname,
        height: editData.height !== '' ? Number(editData.height) : null,
        weight: editData.weight !== '' ? Number(editData.weight) : null,
        goal: editData.goal,
        experience: editData.experience,
      });
      setProfile(updated);
      setEditData(profileToEditData(updated));
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 회원 탈퇴: 서버에서 모든 데이터를 파기한 뒤 이 기기의 로그인 정보도 지운다
  const deleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount();
      clearLocalData();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '탈퇴 처리에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  return {
    profile,
    loading,
    error,
    isEditing,
    editData,
    isSaving,
    saveError,
    startEdit,
    cancelEdit,
    changeField,
    save,
    isDeleting,
    deleteError,
    clearDeleteError: () => setDeleteError(null),
    deleteAccount,
  };
}
