export type RequestStatus = 'pending' | 'approved' | 'rejected';

export const REQUEST_TYPES = [
  'Time Off',
  'Overtime',
  'Loan',
  'Expense Claim',
  'Business Trip',
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Sales',
  'Marketing',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface IRequestItem {
  id: number;
  employee: string;
  department: Department;
  type: RequestType;
  amount: number;
  submittedOn: string; // ISO date
  notes: string;
  status: RequestStatus;
}

export type RequestPayload = Omit<IRequestItem, 'id' | 'status'>;

const seed: IRequestItem[] = [
  { id: 1, employee: 'Lina Haddad', department: 'Engineering', type: 'Time Off', amount: 0, submittedOn: '2026-06-28', notes: 'Annual leave — 3 days', status: 'pending' },
  { id: 2, employee: 'Omar Khoury', department: 'Finance', type: 'Expense Claim', amount: 320, submittedOn: '2026-06-25', notes: 'Client dinner receipts', status: 'pending' },
  { id: 3, employee: 'Sara Nassar', department: 'Human Resources', type: 'Loan', amount: 1500, submittedOn: '2026-06-20', notes: 'Personal loan, 6 installments', status: 'approved' },
  { id: 4, employee: 'Yousef Amin', department: 'Sales', type: 'Business Trip', amount: 940, submittedOn: '2026-06-18', notes: 'Riyadh expo, 2 nights', status: 'pending' },
  { id: 5, employee: 'Dana Suleiman', department: 'Marketing', type: 'Overtime', amount: 120, submittedOn: '2026-06-15', notes: 'Campaign launch weekend', status: 'rejected' },
  { id: 6, employee: 'Hassan Odeh', department: 'Engineering', type: 'Overtime', amount: 200, submittedOn: '2026-06-12', notes: 'Release hotfix support', status: 'approved' },
  { id: 7, employee: 'Rania Zaid', department: 'Finance', type: 'Time Off', amount: 0, submittedOn: '2026-06-10', notes: 'Sick leave — 1 day', status: 'pending' },
  { id: 8, employee: 'Khaled Mansour', department: 'Sales', type: 'Expense Claim', amount: 85, submittedOn: '2026-06-08', notes: 'Taxi fares, client visits', status: 'rejected' },
  { id: 9, employee: 'Noor Barakat', department: 'Human Resources', type: 'Business Trip', amount: 610, submittedOn: '2026-06-05', notes: 'Recruitment fair, Amman', status: 'approved' },
  { id: 10, employee: 'Tariq Jaber', department: 'Marketing', type: 'Loan', amount: 800, submittedOn: '2026-06-02', notes: 'Device purchase advance', status: 'pending' },
  { id: 11, employee: 'Maya Farah', department: 'Engineering', type: 'Time Off', amount: 0, submittedOn: '2026-05-30', notes: 'Remote work — family trip', status: 'approved' },
  { id: 12, employee: 'Ziad Hamdan', department: 'Finance', type: 'Overtime', amount: 150, submittedOn: '2026-05-27', notes: 'Quarter-end closing', status: 'pending' },
];

let items: IRequestItem[] = [...seed];
let nextId = items.length + 1;

const LATENCY_MS = 350;
const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

/** GET /requests */
export const listRequests = (): Promise<IRequestItem[]> => delay(items.map((item) => ({ ...item })));

/** GET /requests/:id */
export const getRequest = (id: number): Promise<IRequestItem | undefined> => {
  const found = items.find((item) => item.id === id);
  return delay(found ? { ...found } : undefined);
};

/** POST /requests */
export const createRequest = (payload: RequestPayload): Promise<IRequestItem> => {
  const created: IRequestItem = { ...payload, id: nextId++, status: 'pending' };
  items = [created, ...items];
  return delay({ ...created });
};

/** PUT /requests/:id */
export const updateRequest = (id: number, payload: RequestPayload): Promise<IRequestItem> => {
  items = items.map((item) => (item.id === id ? { ...item, ...payload } : item));
  const updated = items.find((item) => item.id === id);
  if (!updated) return Promise.reject(new Error(`Request ${id} not found`));
  return delay({ ...updated });
};

/** PATCH /requests/bulk_status — approve / reject a set of requests */
export const updateRequestsStatus = (ids: number[], status: RequestStatus): Promise<IRequestItem[]> => {
  const idSet = new Set(ids);
  items = items.map((item) => (idSet.has(item.id) ? { ...item, status } : item));
  return delay(items.filter((item) => idSet.has(item.id)).map((item) => ({ ...item })));
};
