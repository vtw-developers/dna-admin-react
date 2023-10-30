import {
  AnalyticsDashboard,
  AnalyticsGeography,
  AnalyticsSalesReport,
  ApplicationList,
  BulletinBoardDetail,
  BulletinBoardList,
  CRMContactDetails,
  CRMContactList,
  NewPost,
  PlanningScheduler,
  PlanningTaskDetails,
  PlanningTaskList,
  ResetPasswordPage,
  SignInPage,
  SignUpPage,
  UserProfile,
  DownloadIde
} from './pages';
import { withNavigationWatcher } from './contexts/navigation';
import { EmployeeList } from './pages/dna/sample/employee/employee-list';
import { MenuManage } from './pages/dna/manage/menu/menu-manage';
import { ProgramManage } from './pages/dna/manage/program/program-manage';
import { ContainerList } from './pages/dna/container/container-list';
import { ReservationList } from './pages/dna/sample/reservation/reservation-list';
import { OperationTree } from './pages/dna/ops/operation-tree';

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
    path: '/reservation',
    element: ReservationList,
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
  {
    path: '/bulletin-board',
    element: BulletinBoardList,
  },
  {
    path: '/bulletin-board/new',
    element: NewPost,
  },
  {
    path: '/bulletin-board/detail/:id',
    element: BulletinBoardDetail,
  },
  {
    path: '/container-list',
    element: ContainerList,
  },
  {
    path: '/operation-tree',
    element: OperationTree,
  },
  {
    path: '/download',
    element: DownloadIde,
  },
];

export const appRoutes = routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
