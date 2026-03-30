
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import { getMyProfile, updateMyProfile, MemberProfile } from '../../services/api';

interface EditData {
  nickname: string;
  phone: string;
  birthDate: string;
  height: string;
  weight: string;
  goal: string;
  experience: string;
}

function profileToEditData(profile: MemberProfile): EditData {
  return {
    nickname: profile.nickname ?? '',
    phone: profile.phone ?? '',
    birthDate: profile.birthDate ?? '',
    height: profile.height != null ? String(profile.height) : '',
    weight: profile.weight != null ? String(profile.weight) : '',
    goal: profile.goal ?? '',
    experience: profile.experience ?? '',
  };
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const PROVIDER_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  GOOGLE: { label: 'Google', color: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10', icon: 'ri-google-fill' },
  KAKAO:  { label: 'Kakao',  color: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10', icon: 'ri-kakao-talk-fill' },
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<MemberProfile | null>(null);
  const [editData, setEditData] = useState<EditData>({
    nickname: '', phone: '', birthDate: '', height: '', weight: '', goal: '', experience: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfileData(data);
        setEditData(profileToEditData(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    if (profileData) setEditData(profileToEditData(profileData));
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const updated = await updateMyProfile({
        nickname: editData.nickname,
        phone: editData.phone,
        birthDate: editData.birthDate,
        height: editData.height !== '' ? Number(editData.height) : null,
        weight: editData.weight !== '' ? Number(editData.weight) : null,
        goal: editData.goal,
        experience: editData.experience,
      });
      setProfileData(updated);
      setEditData(profileToEditData(updated));
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    if (profileData) setEditData(profileToEditData(profileData));
  };

  const handleInputChange = (field: keyof EditData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-400" />
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-1">불러오기 실패</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const providerMeta = PROVIDER_LABEL[profileData.provider] ?? { label: profileData.provider, color: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10', icon: 'ri-user-line' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header />

      {/* ── Hero Banner ── */}
      <div className="bg-gray-100 dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-gray-200 dark:ring-white/10 overflow-hidden bg-indigo-500/20 flex items-center justify-center">
                {profileData.imageUrl ? (
                  <img src={profileData.imageUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <i className="ri-user-line text-5xl text-white/80" />
                )}
              </div>
            </div>

            {/* Name / meta */}
            <div className="text-center sm:text-left pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profileData.nickname}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${providerMeta.color} self-center`}>
                  <i className={`${providerMeta.icon} text-xs`} />
                  {providerMeta.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{profileData.email}</p>
              <p className="text-gray-500 text-xs mt-1">가입일 {profileData.createdAt}</p>
            </div>

            {/* Edit button (hero 우측 정렬) */}
            <div className="sm:ml-auto">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 text-gray-900 dark:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-white/10"
                >
                  <i className="ri-edit-line" />
                  프로필 수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="ri-save-line" />}
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors border border-gray-200 dark:border-white/10"
                  >
                    <i className="ri-close-line" />
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: 'ri-calendar-check-line', value: profileData.totalWorkoutDays, unit: '일', label: '총 운동일', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: 'ri-repeat-line',          value: profileData.totalCompletedSets, unit: '세트', label: '완료 세트', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: 'ri-timer-flash-line',     value: formatDuration(profileData.totalDurationSeconds), unit: '', label: '총 운동시간', color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#111] rounded-xl border border-gray-100 dark:border-white/5 p-4 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <i className={`${stat.icon} ${stat.color} text-lg`} />
              </div>
              <div className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white`}>
                {stat.value}<span className="text-sm font-medium ml-0.5">{stat.unit}</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-5">

        {/* ── 개인정보 카드 ── */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <i className="ri-user-settings-line text-blue-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">개인정보</h2>
          </div>

          {saveError && (
            <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
              <i className="ri-error-warning-line flex-shrink-0" />
              {saveError}
            </div>
          )}

          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {/* 이름 */}
            <Field label="이름" icon="ri-user-line">
              {isEditing ? (
                <Input value={editData.nickname} onChange={e => handleInputChange('nickname', e.target.value)} placeholder="이름을 입력하세요" />
              ) : (
                <Value>{profileData.nickname || '-'}</Value>
              )}
            </Field>

            {/* 이메일 */}
            <Field label="이메일" icon="ri-mail-line">
              <Value muted>{profileData.email}</Value>
            </Field>

            {/* 전화번호 */}
            <Field label="전화번호" icon="ri-phone-line">
              {isEditing ? (
                <Input value={editData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="010-0000-0000" />
              ) : (
                <Value>{profileData.phone || '-'}</Value>
              )}
            </Field>

            {/* 생년월일 */}
            <Field label="생년월일" icon="ri-cake-line">
              {isEditing ? (
                <Input type="date" value={editData.birthDate} onChange={e => handleInputChange('birthDate', e.target.value)} />
              ) : (
                <Value>{profileData.birthDate || '-'}</Value>
              )}
            </Field>

            {/* 키 */}
            <Field label="키" icon="ri-ruler-line">
              {isEditing ? (
                <div className="relative">
                  <Input type="number" value={editData.height} onChange={e => handleInputChange('height', e.target.value)} placeholder="0" className="pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-600">cm</span>
                </div>
              ) : (
                <Value>{profileData.height != null ? `${profileData.height} cm` : '-'}</Value>
              )}
            </Field>

            {/* 몸무게 */}
            <Field label="몸무게" icon="ri-scales-line">
              {isEditing ? (
                <div className="relative">
                  <Input type="number" value={editData.weight} onChange={e => handleInputChange('weight', e.target.value)} placeholder="0" className="pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-600">kg</span>
                </div>
              ) : (
                <Value>{profileData.weight != null ? `${profileData.weight} kg` : '-'}</Value>
              )}
            </Field>

            {/* 운동 목표 */}
            <Field label="운동 목표" icon="ri-focus-3-line">
              {isEditing ? (
                <select
                  value={editData.goal}
                  onChange={e => handleInputChange('goal', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value="체중 감량">체중 감량</option>
                  <option value="근력 증가">근력 증가</option>
                  <option value="체력 향상">체력 향상</option>
                  <option value="근육량 증가">근육량 증가</option>
                  <option value="건강 유지">건강 유지</option>
                </select>
              ) : (
                <GoalBadge value={profileData.goal} />
              )}
            </Field>

            {/* 운동 경험 */}
            <Field label="운동 경험" icon="ri-award-line">
              {isEditing ? (
                <select
                  value={editData.experience}
                  onChange={e => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value="초급자">초급자 (6개월 미만)</option>
                  <option value="중급자">중급자 (6개월~2년)</option>
                  <option value="고급자">고급자 (2년 이상)</option>
                </select>
              ) : (
                <ExperienceBadge value={profileData.experience} />
              )}
            </Field>
          </div>
        </div>

        {/* ── 계정 설정 카드 ── */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <i className="ri-settings-3-line text-blue-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">계정 설정</h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            <SettingRow
              icon="ri-notification-3-line"
              iconBg="bg-blue-50 dark:bg-indigo-500/10"
              iconColor="text-blue-600 dark:text-indigo-400"
              title="알림 설정"
              desc="운동 알림 및 성과 알림을 받습니다"
              toggled={true}
            />
            <SettingRow
              icon="ri-cloud-line"
              iconBg="bg-blue-50 dark:bg-indigo-500/10"
              iconColor="text-blue-600 dark:text-indigo-400"
              title="데이터 백업"
              desc="운동 기록을 클라우드에 백업합니다"
              toggled={false}
            />
            <div className="px-6 py-4">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
                <i className="ri-delete-bin-line" />
                계정 삭제
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── 재사용 서브컴포넌트 ── */

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wide mb-1.5">
        <i className={`${icon} text-gray-400 dark:text-gray-600 text-sm`} />
        {label}
      </label>
      {children}
    </div>
  );
}

function Value({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`text-sm py-2 ${muted ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
      {children}
    </p>
  );
}

function GoalBadge({ value }: { value: string | null }) {
  if (!value) return <Value>-</Value>;
  const map: Record<string, string> = {
    '체중 감량': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-500/20',
    '근력 증가': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/20',
    '체력 향상': 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/20',
    '근육량 증가': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/20',
    '건강 유지': 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-500/20',
  };
  return (
    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${map[value] ?? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
      {value}
    </span>
  );
}

function ExperienceBadge({ value }: { value: string | null }) {
  if (!value) return <Value>-</Value>;
  const map: Record<string, string> = {
    '초급자': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20',
    '중급자': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/20',
    '고급자': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/20',
  };
  return (
    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${map[value] ?? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
      {value}
    </span>
  );
}

function SettingRow({ icon, iconBg, iconColor, title, desc, toggled }: {
  icon: string; iconBg: string; iconColor: string; title: string; desc: string; toggled: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} ${iconColor} text-sm`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toggled ? 'bg-indigo-600 dark:bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
