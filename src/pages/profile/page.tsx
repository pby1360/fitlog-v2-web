
import { useState } from 'react';
import Header from '../../components/feature/Header';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '김철수',
    email: 'kimcs@example.com',
    phone: '010-1234-5678',
    birthDate: '1990-05-15',
    height: '175',
    weight: '70',
    goal: '근력 증가',
    experience: '중급자'
  });

  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // 여기에 실제 저장 로직 추가
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내정보</h1>
          <p className="mt-2 text-gray-600">개인정보와 운동 설정을 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 사진 및 기본 정보 */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-6xl text-blue-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{profileData.name}</h2>
              <p className="text-gray-600 mb-4">{profileData.email}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>가입일:</span>
                  <span>2024.01.15</span>
                </div>
                <div className="flex justify-between">
                  <span>총 운동일:</span>
                  <span>45일</span>
                </div>
                <div className="flex justify-between">
                  <span>연속 운동일:</span>
                  <span>7일</span>
                </div>
              </div>
            </Card>
          </div>

          {/* 상세 정보 */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">개인정보</h3>
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <i className="ri-edit-line mr-2"></i>
                    수정
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} size="sm">
                      <i className="ri-save-line mr-2"></i>
                      저장
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <i className="ri-close-line mr-2"></i>
                      취소
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일을 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="전화번호를 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.birthDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">키 (cm)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="키를 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.height}cm</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">몸무게 (kg)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="몸무게를 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.weight}kg</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">운동 목표</label>
                  {isEditing ? (
                    <select
                      value={editData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      <option value="체중 감량">체중 감량</option>
                      <option value="근력 증가">근력 증가</option>
                      <option value="체력 향상">체력 향상</option>
                      <option value="근육량 증가">근육량 증가</option>
                      <option value="건강 유지">건강 유지</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.goal}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">운동 경험</label>
                  {isEditing ? (
                    <select
                      value={editData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    >
                      <option value="초급자">초급자 (6개월 미만)</option>
                      <option value="중급자">중급자 (6개월~2년)</option>
                      <option value="고급자">고급자 (2년 이상)</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.experience}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* 운동 통계 */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">운동 통계</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-gray-600">총 운동일</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">127</div>
                  <div className="text-sm text-gray-600">완료한 세트</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">32h</div>
                  <div className="text-sm text-gray-600">총 운동시간</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-gray-600">연속 운동일</div>
                </div>
              </div>
            </Card>

            {/* 계정 설정 */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">계정 설정</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">알림 설정</h4>
                    <p className="text-sm text-gray-600">운동 알림 및 성과 알림을 받습니다</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">데이터 백업</h4>
                    <p className="text-sm text-gray-600">운동 기록을 클라우드에 백업합니다</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                  </button>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                    <i className="ri-delete-bin-line mr-2"></i>
                    계정 삭제
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
