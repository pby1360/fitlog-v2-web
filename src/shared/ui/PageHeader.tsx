import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

// 경로(to) 또는 클릭 동작(onClick)이 있으면 링크로, 없으면 현재 위치로 표시한다
export interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  // false 면 모바일에서도 제목과 액션을 한 줄에 둔다
  stackOnMobile?: boolean;
}

const crumbLinkClass = 'hover:text-blue-600 dark:hover:text-indigo-400';

export function PageHeader({ breadcrumbs, title, description, actions, stackOnMobile = true }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-600 mb-2">
        {breadcrumbs.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <i className="ri-arrow-right-s-line"></i>}
            {item.to ? (
              <Link to={item.to} className={crumbLinkClass}>{item.label}</Link>
            ) : item.onClick ? (
              <button onClick={item.onClick} className={crumbLinkClass}>{item.label}</button>
            ) : (
              <span>{item.label}</span>
            )}
          </Fragment>
        ))}
      </div>
      <div className={stackOnMobile
        ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
        : 'flex items-center justify-between'}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}
