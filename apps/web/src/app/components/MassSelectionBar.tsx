import { Button, Card, Typography } from 'zds';

const baseClass = 'mass-selection-bar';

interface IMassSelectionBarProps {
  /** Number of currently selected rows. */
  selectedCount: number;
  /** Total number of selectable rows in the current scope (pending requests). */
  totalSelectable: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
}

export const MassSelectionBar = ({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearSelection,
  onApproveAll,
  onRejectAll,
}: IMassSelectionBarProps) => {
  const allSelected = totalSelectable > 0 && selectedCount === totalSelectable;

  if (selectedCount === 0) return null;

  return (
    <Card
      glassCard
      padding="compact"
      borderRadius="sm"
      e2eSelector={baseClass}
      className="mb-4 flex items-center justify-between gap-4 rounded-[8px] px-4 py-2"
    >
      <div className="flex items-center gap-2">
        <Typography variant="sm_medium" e2eSelector="requests-selection-count">
          {allSelected ? (
            <>
              All <b>{selectedCount}</b> requests are selected.
            </>
          ) : (
            <>
              <b>{selectedCount}</b> requests on this page are selected.
            </>
          )}
        </Typography>
        {allSelected ? (
          <Button
            variant="tertiary"
            size="sm"
            noPadding
            onClick={onClearSelection}
            e2eSelector="requests-selection-clear"
          >
            Clear selection
          </Button>
        ) : (
          <Button
            variant="tertiary"
            size="sm"
            noPadding
            onClick={onSelectAll}
            e2eSelector="requests-selection-select-all"
          >
            Select all {totalSelectable} requests
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="invertedSecondary"
          destructive
          size="sm"
          minWidth
          onClick={onRejectAll}
          e2eSelector="requests-selection-reject"
        >
          Reject All
        </Button>
        <Button
          variant="invertedSecondary"
          size="sm"
          minWidth
          onClick={onApproveAll}
          e2eSelector="requests-selection-approve"
        >
          Approve All
        </Button>
      </div>
    </Card>
  );
};

export default MassSelectionBar;
