"use client"

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Calendar,
    Settings,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { UserNav } from './user-nav';

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        {
            label: t('dashboard'),
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            label: t('clients'),
            href: '/dashboard/clients',
            icon: Users,
        },
        {
            label: t('library'),
            href: '/dashboard/library',
            icon: Dumbbell,
        },
        {
            label: t('programs'),
            href: '/dashboard/programs',
            icon: Calendar,
        },
        {
            label: t('settings'),
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    if (isAdmin) {
        navItems.push({
            label: t('admin'),
            href: '/admin',
            icon: ShieldCheck,
        });
    }

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-md text-slate-400"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transition-transform lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <div className="font-bold text-xl text-white">FitTracker Coach</div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                        isActive
                                            ? "bg-indigo-600/10 text-indigo-400"
                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">v1.0.0</span>
                            <UserNav />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
