'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, Users, LayoutList, LayoutDashboard, Building2 } from 'lucide-react';

interface SidebarProps {
  userRole: 'student' | 'tutor';
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarSimulation {
  _id: string;
  organisationProfile: { name: string };
  clientPersona: { name: string };
  status: string;
}

const tutorNav: NavItem[] = [
  { href: '/students', label: 'Students', icon: <Users size={18} /> },
  { href: '/dashboard', label: 'All Simulations', icon: <LayoutList size={18} /> },
];

const MAX_SIDEBAR_SIMS = 5;

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [simulations, setSimulations] = useState<SidebarSimulation[]>([]);

  // Fetch simulations for students; refetch when route changes
  useEffect(() => {
    if (userRole !== 'student') return;

    fetch('/api/simulations')
      .then((res) => res.json())
      .then((data) => setSimulations(data.simulations || []))
      .catch(() => {});
  }, [userRole, pathname]);

  if (userRole === 'tutor') {
    return (
      <SidebarShell isOpen={isOpen} onClose={onClose}>
        <NavLinks items={tutorNav} pathname={pathname} onClose={onClose} />
      </SidebarShell>
    );
  }

  const recent = simulations.slice(0, MAX_SIDEBAR_SIMS);
  const hasMore = simulations.length > MAX_SIDEBAR_SIMS;

  return (
    <SidebarShell isOpen={isOpen} onClose={onClose}>
      {/* Dashboard + New Simulation */}
      <NavLinks
        items={[
          { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { href: '/simulation/new', label: 'New Simulation', icon: <PlusCircle size={18} /> },
        ]}
        pathname={pathname}
        onClose={onClose}
      />

      {/* Simulation list */}
      {recent.length > 0 && (
        <div className="mt-4">
          <p className="px-3 mb-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Recent
          </p>
          <div className="space-y-0.5">
            {recent.map((sim) => {
              const active = pathname === `/simulation/${sim._id}`;
              const isActive = sim.status === 'active';
              return (
                <Link
                  key={sim._id}
                  href={`/simulation/${sim._id}`}
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'bg-navy-50 text-navy-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`shrink-0 ${active ? 'text-navy-600' : 'text-slate-400'}`}>
                    <Building2 size={15} />
                  </span>
                  <span className="truncate text-xs">
                    {sim.clientPersona.name} — {sim.organisationProfile.name}
                  </span>
                  {isActive && (
                    <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="block px-3 mt-2 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              View all ({simulations.length})
            </Link>
          )}
        </div>
      )}
    </SidebarShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function SidebarShell({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-56 bg-white border-r border-slate-200 transition-transform duration-200 lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-3 space-y-1">{children}</nav>
      </aside>
    </>
  );
}

function NavLinks({
  items,
  pathname,
  onClose,
}: {
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-navy-50 text-navy-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className={active ? 'text-navy-600' : 'text-slate-400'}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
