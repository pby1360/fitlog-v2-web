
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
  GOOGLE: { label: 'Google', color: 'bg-red-50 text-red-600 border-red-200', icon: 'ri-google-fill' },
  KAKAO:  { label: 'Kakao',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'ri-kakao-talk-fill' },
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">프로필을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-500" />
          </div>
          <p className="text-gray-700 font-medium mb-1">불러오기 실패</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const providerMeta = PROVIDER_LABEL[profileData.provider] ?? { label: profileData.provider, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'ri-user-line' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white/30 overflow-hidden bg-blue-400 flex items-center justify-center">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{profileData.nickname}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${providerMeta.color} self-center`}>
                  <i className={`${providerMeta.icon} text-xs`} />
                  {providerMeta.label}
                </span>
              </div>
              <p className="text-blue-200 text-sm">{profileData.email}</p>
              <p className="text-blue-300 text-xs mt-1">가입일 {profileData.createdAt}</p>
            </div>

            {/* Edit button (hero 우측 정렬) */}
            <div className="sm:ml-auto">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors border border-white/20"
                >
                  <i className="ri-edit-line" />
                  프로필 수정
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-60"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <i className="ri-save-line" />}
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors border border-white/20"
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
            { icon: 'ri-calendar-check-line', value: profileData.totalWorkoutDays, unit: '일', label: '총 운동일', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: 'ri-repeat-line',          value: profileData.totalCompletedSets, unit: '세트', label: '완료 세트', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: 'ri-timer-flash-line',     value: formatDuration(profileData.totalDurationSeconds), unit: '', label: '총 운동시간', color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <i className={`${stat.icon} ${stat.color} text-lg`} />
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}<span className="text-sm font-medium ml-0.5">{stat.unit}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-5">

        {/* ── 개인정보 카드 ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <i className="ri-user-settings-line text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">개인정보</h2>
          </div>

          {saveError && (
            <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">kg</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <i className="ri-settings-3-line text-gray-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">계정 설정</h2>
          </div>

          <div className="divide-y divide-gray-100">
            <SettingRow
              icon="ri-notification-3-line"
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              title="알림 설정"
              desc="운동 알림 및 성과 알림을 받습니다"
              toggled={true}
            />
            <SettingRow
              icon="ri-cloud-line"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title="데이터 백업"
              desc="운동 기록을 클라우드에 백업합니다"
              toggled={false}
            />
            <div className="px-6 py-4">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
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
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        <i className={`${icon} text-gray-400 text-sm`} />
        {label}
      </label>
      {children}
    </div>
  );
}

function Value({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`text-sm py-2 ${muted ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
      {children}
    </p>
  );
}

function GoalBadge({ value }: { value: string | null }) {
  if (!value) return <Value>-</Value>;
  const map: Record<string, string> = {
    '체중 감량': 'bg-orange-50 text-orange-700 border-orange-200',
    '근력 증가': 'bg-blue-50 text-blue-700 border-blue-200',
    '체력 향상': 'bg-green-50 text-green-700 border-green-200',
    '근육량 증가': 'bg-purple-50 text-purple-700 border-purple-200',
    '건강 유지': 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${map[value] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {value}
    </span>
  );
}

function ExperienceBadge({ value }: { value: string | null }) {
  if (!value) return <Value>-</Value>;
  const map: Record<string, string> = {
    '초급자': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '중급자': 'bg-amber-50 text-amber-700 border-amber-200',
    '고급자': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${map[value] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
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
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toggled ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
