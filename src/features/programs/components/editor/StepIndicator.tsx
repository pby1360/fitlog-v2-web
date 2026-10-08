const STEP_LABELS = ['프로그램 정보', '운동 부위', '운동 항목', '세트 설정'];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, index) => {
          const step = index + 1;
          return (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600'
              }`}>
                {step}
              </div>
              <div className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600 dark:text-indigo-400 font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
                {label}
              </div>
              {step < STEP_LABELS.length && (
                <div className={`w-12 h-0.5 mx-4 ${currentStep > step ? 'bg-gradient-to-r from-indigo-500 to-violet-600' : 'bg-gray-100 dark:bg-white/5'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
