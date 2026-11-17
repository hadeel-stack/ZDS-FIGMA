import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  Button,
  ControlledDatePicker,
  ControlledInput,
  ControlledSelect,
  ControlledTextarea,
  Drawer,
  Spinner,
} from 'zds';
import {
  createRequest,
  DEPARTMENTS,
  getRequest,
  REQUEST_TYPES,
  updateRequest,
  type Department,
  type RequestType,
} from '../data/requests';

interface IRequestFormValues {
  employee: string;
  department: Department | '';
  type: RequestType | '';
  amount: string;
  submittedOn: Date | null;
  notes: string;
}

const EMPTY_VALUES: IRequestFormValues = {
  employee: '',
  department: '',
  type: '',
  amount: '',
  submittedOn: null,
  notes: '',
};

interface IRequestFormDrawerProps {
  open: boolean;
  mode: 'new' | 'edit';
  requestId?: number;
  /** Called on close; `submitted` is true when a request was created/updated. */
  onClose: (submitted: boolean) => void;
}

const baseClass = 'request-form-drawer';

export const RequestFormDrawer = ({
  open,
  mode,
  requestId,
  onClose,
}: IRequestFormDrawerProps) => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<IRequestFormValues>({
    defaultValues: EMPTY_VALUES,
    mode: 'onBlur',
  });

  const loadFormData = useCallback(async () => {
    if (mode === 'edit' && requestId !== undefined) {
      setIsFormLoading(true);
      try {
        const request = await getRequest(requestId);
        if (request) {
          reset({
            employee: request.employee,
            department: request.department,
            type: request.type,
            amount: request.amount ? String(request.amount) : '',
            submittedOn: new Date(request.submittedOn),
            notes: request.notes,
          });
        }
      } finally {
        setIsFormLoading(false);
      }
    } else {
      reset(EMPTY_VALUES);
    }
  }, [mode, requestId, reset]);

  useEffect(() => {
    if (!open) return;
    void loadFormData();
  }, [open, loadFormData]);

  const onSubmit: SubmitHandler<IRequestFormValues> = async (values) => {
    setIsSaveLoading(true);
    try {
      const payload = {
        employee: values.employee.trim(),
        department: values.department as Department,
        type: values.type as RequestType,
        amount: values.amount ? Number(values.amount) : 0,
        submittedOn: format(values.submittedOn ?? new Date(), 'yyyy-MM-dd'),
        notes: values.notes.trim(),
      };
      if (mode === 'edit' && requestId !== undefined) {
        await updateRequest(requestId, payload); // PUT
      } else {
        await createRequest(payload); // POST
      }
      onClose(true);
    } finally {
      setIsSaveLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      title={mode === 'new' ? 'New Request' : 'Edit Request'}
      description={
        mode === 'new'
          ? 'Submit a new employee request for approval'
          : `Update request #${requestId} and save your changes`
      }
      onClose={() => onClose(false)}
      e2eSelector={baseClass}
      width="550px"
      footer={
        <>
          <Button
            e2eSelector={`${baseClass}-footer-cancel`}
            variant="secondary"
            size="sm"
            onClick={() => onClose(false)}
            disabled={isSaveLoading}
            minWidth
          >
            Cancel
          </Button>
          <Button
            e2eSelector={`${baseClass}-footer-confirm`}
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            loading={isSaveLoading}
            disabled={isFormLoading}
            minWidth
          >
            Save
          </Button>
        </>
      }
    >
      <Spinner
        isLoading={isFormLoading}
        inBox
        e2eSelector={`${baseClass}-spinner`}
      />
      {!isFormLoading && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <ControlledInput
            name="employee"
            control={control}
            rules={{ required: 'Employee name is required' }}
            label="Employee"
            required
            placeholder="e.g. Lina Haddad"
            e2eSelector={`${baseClass}-employee`}
          />
          <ControlledSelect
            name="type"
            control={control}
            rules={{ required: 'Request type is required' }}
            label="Request Type"
            required
            placeholder="Select a type"
            options={REQUEST_TYPES.map((type) => ({
              label: type,
              value: type,
            }))}
            e2eSelector={`${baseClass}-type`}
          />
          <ControlledSelect
            name="department"
            control={control}
            rules={{ required: 'Department is required' }}
            label="Department"
            required
            placeholder="Select a department"
            options={DEPARTMENTS.map((department) => ({
              label: department,
              value: department,
            }))}
            e2eSelector={`${baseClass}-department`}
          />
          <ControlledInput
            name="amount"
            control={control}
            rules={{
              validate: (value: string) =>
                !value || Number(value) >= 0 || 'Amount must be zero or more',
            }}
            label="Amount"
            type="number"
            min={0}
            placeholder="0"
            iconRight={<span>JOD</span>}
            iconRightVariant="suffix"
            hint="Leave empty for non-financial requests"
            e2eSelector={`${baseClass}-amount`}
          />
          <ControlledDatePicker
            name="submittedOn"
            control={control}
            rules={{ required: 'Submission date is required' }}
            label="Submitted On"
            required
            placeholder="Pick a date"
            e2eSelector={`${baseClass}-submitted-on`}
          />
          <ControlledTextarea
            name="notes"
            control={control}
            label="Notes"
            rows={4}
            placeholder="Add context for the approver..."
            e2eSelector={`${baseClass}-notes`}
          />
        </form>
      )}
    </Drawer>
  );
};

export default RequestFormDrawer;
