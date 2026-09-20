import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { api } from '../../services/apiClient';
import type { User } from '../../types';

export function AccountMenu({ user, loggedOut }: { user: User; loggedOut: () => void }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?';
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 pr-3 transition ${open ? 'border-moss/30 bg-white' : 'border-transparent hover:border-ink/10 hover:bg-white'}`}
            >
                <span className="grid size-8 place-items-center rounded-full bg-moss text-xs font-bold text-white">
                    {initials}
                </span>
                <span className="hidden text-sm font-semibold text-ink/80 sm:inline">
                    {user.name}
                </span>
                <ChevronDown
                    size={15}
                    className={`text-ink/40 transition ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl"
                >
                    <div className="border-b border-ink/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-ink/50">{user.email}</p>
                    </div>
                    <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                await api.logout();
                            } finally {
                                loggedOut();
                            }
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:opacity-60"
                    >
                        <LogOut size={16} />
                        {busy ? 'Signing out…' : 'Log out'}
                    </button>
                </div>
            )}
        </div>
    );
}
