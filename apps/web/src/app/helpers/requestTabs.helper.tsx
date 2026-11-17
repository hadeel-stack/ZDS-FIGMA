import { ReactNode } from 'react';
import type { ITabItem } from 'zds';
import { REQUEST_TYPES, type RequestType } from '../data/requests';

export type TypeFilter = RequestType | 'all';

export const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All Requests' },
  ...REQUEST_TYPES.map((type) => ({ id: type, label: type })),
];

/**
 * Builds the top-level Tabs items for the request types — mirrors
 * mfe-approvals' `getApprovalTabs`: every tab shares the same content panel,
 * which reads the active type from page state.
 */
export const getRequestTypeTabs = (
  counts: Record<TypeFilter, number>,
  content: ReactNode,
): ITabItem[] =>
  TYPE_TABS.map((tab) => ({
    label: tab.label,
    count: counts[tab.id] ?? 0,
    content,
  }));
