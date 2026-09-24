
import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const ProgramsPage = lazy(() => import('../pages/programs/page'));
const WorkoutPage = lazy(() => import('../pages/workout/page'));
const WorkoutSessionPage = lazy(() => import('../pages/workout/session/page'));
const HistoryPage = lazy(() => import('../pages/history/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const AuthCallbackPage = lazy(() => import('../pages/auth/callback/page'));
const PrivacyPolicyPage = lazy(() => import('../pages/legal/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('../pages/legal/TermsPage'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/programs',
    element: <ProgramsPage />,
  },
  {
    path: '/workout',
    element: <WorkoutPage />,
  },
  {
    path: '/workout/session',
    element: <WorkoutSessionPage />,
  },
  {
    path: '/history',
    element: <HistoryPage />,
  },
  {
    path: '/history/:id',
    element: <HistoryPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  }
];

export default routes;
