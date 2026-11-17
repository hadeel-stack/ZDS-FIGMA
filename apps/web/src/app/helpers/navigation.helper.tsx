import type { ReactNode } from 'react';
import {
  BarChart,
  FileText,
  Home,
  Question,
  Setting,
  Users,
  Wallet,
} from 'zds';

export interface INavEntry {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

export const MAIN_NAV: INavEntry[] = [
  { id: 'home', label: 'Home', path: '/home', icon: <Home size={20} /> },
  {
    id: 'requests',
    label: 'Requests',
    path: '/requests',
    icon: <FileText size={20} />,
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: <Users size={20} />,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/payroll',
    icon: <Wallet size={20} />,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: <BarChart size={20} />,
  },
];

export const UTILITY_NAV: INavEntry[] = [
  { id: 'help', label: 'Help', path: '/help', icon: <Question size={20} /> },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: <Setting size={20} />,
  },
];

export const ALL_NAV = [...MAIN_NAV, ...UTILITY_NAV];

export const findNavEntryByPath = (pathname: string): INavEntry | undefined =>
  ALL_NAV.find(
    (entry) =>
      pathname === entry.path || pathname.startsWith(`${entry.path}/`),
  );
