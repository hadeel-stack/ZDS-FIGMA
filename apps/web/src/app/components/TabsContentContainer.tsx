import { ReactNode } from 'react';
import { PageActionContainer } from 'zds';

interface ITabsContentContainerProps {
  /** Mass-selection banner rendered above the divided layout. */
  selectionBar?: ReactNode;
  /** Status sidebar (SubNav) rendered in the start column. */
  sidebar: ReactNode;
  /** Table content — wrapped in a PageActionContainer. */
  children: ReactNode;
}

const baseClass = 'tabs-content-container';

export const TabsContentContainer = ({
  selectionBar,
  sidebar,
  children,
}: ITabsContentContainerProps) => (
  <div className={`${baseClass}__wrapper pt-4`}>
    {selectionBar}
    <div className={`${baseClass} flex items-start gap-3`}>
      {sidebar}
      <PageActionContainer
        className="min-w-0 flex-1"
        e2eSelector="requests-page-container"
      >
        {children}
      </PageActionContainer>
    </div>
  </div>
);

export default TabsContentContainer;
