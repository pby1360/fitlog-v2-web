
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const ProgramsPage = lazy(() => import('../pages/programs/page'));
const WorkoutPage = lazy(() => import('../pages/workout/page'));
const HistoryPage = lazy(() => import('../pages/history/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

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
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
