import type { ReactNode } from 'react';
import { Input } from '@/shared/ui/Input';
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS, NEUTRAL_BADGE_CLASS, type EditData } from '../lib/profileOptions';
import type { MemberProfile } from '../types';
import { ProfileCard } from './ProfileCard';

interface PersonalInfoCardProps {
  profile: MemberProfile;
  isEditing: boolean;
  editData: EditData;
  saveError: string | null;
  onChange: (field: keyof EditData, value: string) => void;
}

const selectClass = 'w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

// 개인정보: 보기 모드는 값·배지, 수정 모드는 입력 폼
export function PersonalInfoCard({ profile, isEditing, editData, saveError, onChange }: PersonalInfoCardProps) {
  return (
    <ProfileCard icon="ri-user-settings-line" title="개인정보">
      {saveError && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <i className="ri-error-warning-line flex-shrink-0" />
          {saveError}
        </div>
      )}

      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <Field label="이름" icon="ri-user-line">
          {isEditing ? (
            <Input value={editData.nickname} onChange={e => onChange('nickname', e.target.value)} placeholder="이름을 입력하세요" />
          ) : (
            <Value>{profile.nickname || '-'}</Value>
          )}
        </Field>

        <Field label="이메일" icon="ri-mail-line">
          <Value muted>{profile.email}</Value>
        </Field>

        <Field label="키" icon="ri-ruler-line">
          {isEditing ? (
            <UnitInput unit="cm" value={editData.height} onChange={value => onChange('height', value)} />
          ) : (
            <Value>{profile.height != null ? `${profile.height} cm` : '-'}</Value>
          )}
        </Field>

        <Field label="몸무게" icon="ri-scales-line">
          {isEditing ? (
            <UnitInput unit="kg" value={editData.weight} onChange={value => onChange('weight', value)} />
          ) : (
            <Value>{profile.weight != null ? `${profile.weight} kg` : '-'}</Value>
          )}
        </Field>

        <Field label="운동 목표" icon="ri-focus-3-line">
          {isEditing ? (
            <OptionSelect options={GOAL_OPTIONS} value={editData.goal} onChange={value => onChange('goal', value)} />
          ) : (
            <OptionBadge options={GOAL_OPTIONS} value={profile.goal} />
          )}
        </Field>

        <Field label="운동 경험" icon="ri-award-line">
          {isEditing ? (
            <OptionSelect options={EXPERIENCE_OPTIONS} value={editData.experience} onChange={value => onChange('experience', value)} />
          ) : (
            <OptionBadge options={EXPERIENCE_OPTIONS} value={profile.experience} />
          )}
        </Field>
      </div>
    </ProfileCard>
  );
}

type Option = { value: string; label: string; badgeClass: string };

function Field({ label, icon, children }: { label: string; icon: string; children: ReactNode }) {
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

function Value({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <p className={`text-sm py-2 ${muted ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
      {children}
    </p>
  );
}

function UnitInput({ unit, value, onChange }: { unit: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0" className="pr-10" />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-600">{unit}</span>
    </div>
  );
}

function OptionSelect({ options, value, onChange }: { options: Option[]; value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectClass}>
      <option value="">선택하세요</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function OptionBadge({ options, value }: { options: Option[]; value: string | null }) {
  if (!value) return <Value>-</Value>;
  const badgeClass = options.find(option => option.value === value)?.badgeClass ?? NEUTRAL_BADGE_CLASS;
  return (
    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
      {value}
    </span>
  );
}
