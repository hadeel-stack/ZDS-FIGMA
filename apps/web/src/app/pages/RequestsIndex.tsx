import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Button,
  Check,
  Close,
  DataTable,
  Edit,
  Plus,
  Spinner,
  Status,
  SubNav,
  Tabs,
  Typography,
  useConfirmDialog,
  type IDataTableProps,
  type StatusColorSchemeType,
} from 'zds';
import {
  DEPARTMENTS,
  listRequests,
  updateRequestsStatus,
  type IRequestItem,
  type RequestStatus,
} from '../data/requests';
import MassSelectionBar from '../components/MassSelectionBar';
import RequestFormDrawer from '../components/RequestFormDrawer';
import TabsContentContainer from '../components/TabsContentContainer';
import {
  getRequestTypeTabs,
  TYPE_TABS,
  type TypeFilter,
} from '../helpers/requestTabs.helper';

const STATUS_META: Record<
  RequestStatus,
  { label: string; colorScheme: StatusColorSchemeType }
> = {
  pending: { label: 'Pending', colorScheme: 'warning' },
  approved: { label: 'Approved', colorScheme: 'success' },
  rejected: { label: 'Rejected', colorScheme: 'error' },
};

type StatusFilter = RequestStatus | 'all';

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

interface IDateRangeFilterValue {
  from?: Date | null;
  to?: Date | null;
}

interface IFormDrawerState {
  open: boolean;
  mode: 'new' | 'edit';
  requestId?: number;
}

const FILTER_DEFS: NonNullable<IDataTableProps<IRequestItem>['filters']> = [
  {
    id: 'department',
    label: 'Department',
    options: DEPARTMENTS.map((department) => ({
      label: department,
      value: department,
    })),
  },
  { id: 'submittedOn', label: 'Submitted On', type: 'dateRange' },
];

export function RequestsIndex() {
  const { confirm, dialog } = useConfirmDialog();

  const [requests, setRequests] = useState<IRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTypeTab, setActiveTypeTab] = useState(0);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formDrawer, setFormDrawer] = useState<IFormDrawerState>({
    open: false,
    mode: 'new',
  });

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      setRequests(await listRequests());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const activeType = TYPE_TABS[activeTypeTab].id;

  const typeRequests = useMemo(
    () =>
      activeType === 'all'
        ? requests
        : requests.filter((request) => request.type === activeType),
    [requests, activeType],
  );

  const tabRequests = useMemo(
    () =>
      activeStatus === 'all'
        ? typeRequests
        : typeRequests.filter((request) => request.status === activeStatus),
    [typeRequests, activeStatus],
  );

  // Mirrors the DataTable's client-side filtering (chips + search) so the
  // pagination footer's `totalItems` matches what the table actually shows.
  const filteredCount = useMemo(() => {
    const department = columnFilters.find((f) => f.id === 'department')
      ?.value as string | undefined;
    const dateRange = columnFilters.find((f) => f.id === 'submittedOn')
      ?.value as IDateRangeFilterValue | undefined;
    const query = searchQuery.trim().toLowerCase();

    return tabRequests.filter((request) => {
      if (department && request.department !== department) return false;
      if (dateRange?.from || dateRange?.to) {
        const submitted = new Date(request.submittedOn);
        if (dateRange.from && submitted < dateRange.from) return false;
        if (dateRange.to && submitted > dateRange.to) return false;
      }
      if (query) {
        const haystack = [
          request.employee,
          request.type,
          request.department,
          request.submittedOn,
          request.amount > 0 ? `${request.amount.toLocaleString()} JOD` : '—',
          request.status,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    }).length;
  }, [tabRequests, columnFilters, searchQuery]);

  const countByType = useMemo(() => {
    const counts = { all: requests.length } as Record<TypeFilter, number>;
    TYPE_TABS.forEach((tab) => {
      if (tab.id !== 'all') counts[tab.id] = 0;
    });
    requests.forEach((request) => {
      counts[request.type] += 1;
    });
    return counts;
  }, [requests]);

  const countByStatus = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: typeRequests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    typeRequests.forEach((request) => {
      counts[request.status] += 1;
    });
    return counts;
  }, [typeRequests]);

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );

  const selectablePendingIds = useMemo(
    () =>
      tabRequests
        .filter((request) => request.status === 'pending')
        .map((request) => request.id),
    [tabRequests],
  );

  const selectAllPending = useCallback(() => {
    setRowSelection(
      Object.fromEntries(selectablePendingIds.map((id) => [String(id), true])),
    );
  }, [selectablePendingIds]);

  const openNewRequestDrawer = useCallback(
    () => setFormDrawer({ open: true, mode: 'new' }),
    [],
  );

  const openEditRequestDrawer = useCallback(
    (requestId: number) =>
      setFormDrawer({ open: true, mode: 'edit', requestId }),
    [],
  );

  const onFormDrawerClose = useCallback(
    (submitted: boolean) => {
      setFormDrawer((prev) => ({ ...prev, open: false }));
      if (submitted) void fetchRequests();
    },
    [fetchRequests],
  );

  const bulkUpdateStatus = useCallback(
    async (
      ids: number[],
      status: Extract<RequestStatus, 'approved' | 'rejected'>,
    ) => {
      const isApprove = status === 'approved';
      const confirmed = await confirm({
        title: isApprove ? 'Approve requests' : 'Reject requests',
        description: `You are about to ${isApprove ? 'approve' : 'reject'} ${ids.length} request${
          ids.length === 1 ? '' : 's'
        }. This action cannot be undone.`,
        confirmLabel: isApprove ? 'Approve' : 'Reject',
        destructive: !isApprove,
        featuredIconVariant: isApprove ? 'approve' : 'delete',
        e2eSelector: 'requests-bulk-confirm',
      });
      if (!confirmed) return;

      setIsLoading(true);
      try {
        await updateRequestsStatus(ids, status);
        setRowSelection({});
        setRequests(await listRequests());
      } finally {
        setIsLoading(false);
      }
    },
    [confirm],
  );

  const columns = useMemo<ColumnDef<IRequestItem, unknown>[]>(
    () => [
      {
        id: 'employee',
        accessorKey: 'employee',
        header: 'Employee',
        locked: true,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: 'Request Type',
      },
      {
        id: 'department',
        accessorKey: 'department',
        header: 'Department',
        filterFn: 'equalsString',
      },
      {
        id: 'submittedOn',
        accessorKey: 'submittedOn',
        header: 'Submitted On',
        filterFn: (row, columnId, filterValue: IDateRangeFilterValue) => {
          if (!filterValue) return true;
          const submitted = new Date(row.getValue<string>(columnId));
          if (filterValue.from && submitted < filterValue.from) return false;
          if (filterValue.to && submitted > filterValue.to) return false;
          return true;
        },
      },
      {
        id: 'amount',
        accessorFn: (row) =>
          row.amount > 0 ? `${row.amount.toLocaleString()} JOD` : '—',
        header: 'Amount',
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        meta: { label: 'Status' },
        cell: ({ row }) => {
          const meta = STATUS_META[row.original.status];
          return (
            <Status
              colorScheme={meta.colorScheme}
              label={meta.label}
              e2eSelector={`request-status-${row.original.id}`}
            />
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        meta: { label: 'Actions' },
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.status === 'pending' && (
              <>
                <Button
                  iconOnly
                  variant="tertiary"
                  size="sm"
                  title="Approve"
                  iconLeft={<Check />}
                  onClick={() =>
                    void bulkUpdateStatus([row.original.id], 'approved')
                  }
                  e2eSelector={`request-approve-${row.original.id}`}
                />
                <Button
                  iconOnly
                  variant="tertiary"
                  size="sm"
                  destructive
                  title="Reject"
                  iconLeft={<Close />}
                  onClick={() =>
                    void bulkUpdateStatus([row.original.id], 'rejected')
                  }
                  e2eSelector={`request-reject-${row.original.id}`}
                />
              </>
            )}
            <Button
              iconOnly
              variant="tertiary"
              size="sm"
              title="Edit"
              iconLeft={<Edit />}
              onClick={() => openEditRequestDrawer(row.original.id)}
              e2eSelector={`request-edit-${row.original.id}`}
            />
          </div>
        ),
      },
    ],
    [openEditRequestDrawer, bulkUpdateStatus],
  );

  const onTypeTabChange = useCallback((index: number) => {
    setActiveTypeTab(index);
    setActiveStatus('all');
    setRowSelection({});
  }, []);

  const onStatusChange = useCallback((id: string) => {
    setActiveStatus(id as StatusFilter);
    setRowSelection({});
  }, []);

  const statusSidebarTabs = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: countByStatus[tab.id],
        loading: isLoading,
        disabled: isLoading,
      })),
    [countByStatus, isLoading],
  );

  const tabContent = (
    <TabsContentContainer
      selectionBar={
        <MassSelectionBar
          selectedCount={selectedIds.length}
          totalSelectable={selectablePendingIds.length}
          onSelectAll={selectAllPending}
          onClearSelection={() => setRowSelection({})}
          onApproveAll={() => void bulkUpdateStatus(selectedIds, 'approved')}
          onRejectAll={() => void bulkUpdateStatus(selectedIds, 'rejected')}
        />
      }
      sidebar={
        <SubNav
          title="Status"
          tabs={statusSidebarTabs}
          activeTab={activeStatus}
          onTabChange={onStatusChange}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((open) => !open)}
          e2eSelector="requests-status-subnav"
        />
      }
    >
      <Spinner
        isLoading={isLoading}
        inBox
        e2eSelector="requests-table-spinner"
      />

      <DataTable
        e2eSelector="requests-index-table"
        columns={columns}
        data={tabRequests}
        totalItems={filteredCount}
        emptyMessage="No requests match the current filters"
        enableSearch
        manualSearch={false}
        onSearch={setSearchQuery}
        searchPlaceholder="Search requests..."
        filters={FILTER_DEFS}
        manualFiltering={false}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        enableColumnReorder
        enableColumnPinning
        enableEditColumns
        enableExport
        exportFilename="approval-requests"
        exportTitle="Approval Requests"
        selectable
        getRowId={(request) => String(request.id)}
        enableRowSelection={(row) => row.original.status === 'pending'}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        viewLayouts={['table', 'grid']}
        gridCard={{
          hideThumbnail: true,
          title: (row) => row.original.employee,
          subtitle: (row) =>
            `${row.original.type} • ${row.original.department}`,
          meta: (row) =>
            `Submitted ${row.original.submittedOn}${
              row.original.amount > 0
                ? ` • ${row.original.amount.toLocaleString()} JOD`
                : ''
            }`,
          status: (row) => STATUS_META[row.original.status],
        }}
        onRowClick={(row) => openEditRequestDrawer(row.original.id)}
      />
    </TabsContentContainer>
  );

  const typeTabs = getRequestTypeTabs(countByType, tabContent);

  return (
    <div className="p-4">
      <Tabs
        e2eSelector="requests-type-tabs"
        size="sm"
        activeIndex={activeTypeTab}
        onActiveIndexChange={onTypeTabChange}
        items={typeTabs}
        tabListAddon={
          <Button
            size="sm"
            iconLeft={<Plus />}
            onClick={openNewRequestDrawer}
            e2eSelector="requests-new-button"
          >
            New Request
          </Button>
        }
      />

      {dialog}
      <RequestFormDrawer
        open={formDrawer.open}
        mode={formDrawer.mode}
        requestId={formDrawer.requestId}
        onClose={onFormDrawerClose}
      />
    </div>
  );
}

export default RequestsIndex;
