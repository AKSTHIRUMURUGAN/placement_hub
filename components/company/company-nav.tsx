'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/company/dashboard', label: 'Dashboard' },
  { href: '/company/drives', label: 'Drives' },
  { href: '/company/candidates', label: 'Candidates' },
  { href: '/company/profile', label: 'Profile' },
];

export function CompanyNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              active
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
