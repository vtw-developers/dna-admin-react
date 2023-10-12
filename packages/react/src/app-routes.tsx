import {
  AnalyticsDashboard,
  AnalyticsGeography,
  AnalyticsSalesReport,
  CRMContactDetails,
  CRMContactList,
  PlanningScheduler,
  PlanningTaskDetails,
  PlanningTaskList,
  ResetPasswordPage,
  SignInPage,
  SignUpPage,
  UserProfile,
} from './pages';
import { withNavigationWatcher } from './contexts/navigation';
import { EmployeeList } from './pages/dna/sample/employee/employee-list';
import { MenuManage } from './pages/dna/manage/menu/menu-manage';
import { ProgramManage } from './pages/dna/manage/program/program-manage';
import { ApplicationList } from './pages/dna/sample/application/application-list';

const routes = [
  {
    path: '/crm-contact-details',
    element: CRMContactDetails,
  },
  {
    path: '/crm-contact-list',
    element: CRMContactList,
  },
  {
    path: '/planning-task-list',
    element: PlanningTaskList,
  },
  {
    path: '/planning-task-details',
    element: PlanningTaskDetails,
  },
  {
    path: '/planning-scheduler',
    element: PlanningScheduler,
  },
  {
    path: '/analytics-dashboard',
    element: AnalyticsDashboard,
  },
  {
    path: '/analytics-sales-report',
    element: AnalyticsSalesReport,
  },
  {
    path: '/analytics-geography',
    element: AnalyticsGeography,
  },
  {
    path: '/sign-in-form',
    element: SignInPage,
  },
  {
    path: '/sign-up-form',
    element: SignUpPage,
  },
  {
    path: '/reset-password-form',
    element: ResetPasswordPage,
  },
  {
    path: '/user-profile',
    element: UserProfile,
  },
  {
    path: '/employee',
    element: EmployeeList,
  },
  {
    path: '/application',
    element: ApplicationList,
  },
  {
    path: '/manage/menu',
    element: MenuManage,
  },
  {
    path: '/manage/program',
    element: ProgramManage,
  },
];

export const appRoutes = routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
