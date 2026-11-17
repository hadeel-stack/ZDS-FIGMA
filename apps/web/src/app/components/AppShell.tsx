import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SideNav, TopNav, type SideNavItem } from 'zds';
import {
  ALL_NAV,
  findNavEntryByPath,
  MAIN_NAV,
  UTILITY_NAV,
} from '../helpers/navigation.helper';

const toSideNavItems = (entries: typeof ALL_NAV): SideNavItem[] =>
  entries.map(({ id, label, icon }) => ({ id, label, icon }));

const NAV_ITEMS = toSideNavItems(MAIN_NAV);
const UTILITY_ITEMS = toSideNavItems(UTILITY_NAV);

const LOGO_MARK = (
  <span
    role="img"
    aria-label="ZenHR logo"
    className="flex items-center justify-center size-8 rounded-full bg-[#00aeac] text-white font-bold text-sm"
  >
    Z
  </span>
);

const LOGO_FULL = (
  <span className="font-bold text-[18px] leading-6 text-[#1d2027] tracking-tight">
    ZenHR
  </span>
);

const PROFILE_AVATAR = (
  <span className="size-full flex items-center justify-center bg-[#e5ecff] text-[#2a303b] font-semibold text-sm">
    DA
  </span>
);

interface IAppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: IAppShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeEntry = useMemo(() => findNavEntryByPath(pathname), [pathname]);

  const onNavItemClick = useCallback(
    (id: string) => {
      const entry = ALL_NAV.find((navEntry) => navEntry.id === id);
      if (entry) navigate(entry.path);
      setMobileNavOpen(false);
    },
    [navigate],
  );

  return (
    <div className="app-page-bg fixed inset-0 flex">
      <SideNav
        e2eSelector="app"
        items={NAV_ITEMS}
        utilityItems={UTILITY_ITEMS}
        activeItem={activeEntry?.id}
        onItemClick={onNavItemClick}
        logoMark={LOGO_MARK}
        logoFull={LOGO_FULL}
        userProfile={{ name: 'Dema Alhyari', role: 'HR Admin' }}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          e2eSelector="app"
          pageTitle={activeEntry?.label ?? 'ZenHR'}
          showMenuIcon
          onMenuClick={() => setMobileNavOpen(true)}
          branchName="KSA Branch"
          notificationCount={3}
          profileAvatar={PROFILE_AVATAR}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
