import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function Modal({
    title,
    subtitle,
    size = 'sm',
    children,
    close,
}: {
    title: string;
    subtitle?: string;
    size?: 'sm' | 'md';
    children: React.ReactNode;
    close: () => void;
}) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [close]);
    return (
        <div
            className="fixed inset-0 z-10 grid place-items-center bg-ink/40 p-4"
            onMouseDown={close}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) => event.stopPropagation()}
                className={`max-h-[85vh] w-full overflow-y-auto rounded-2xl bg-paper p-5 shadow-2xl ${size === 'md' ? 'max-w-md' : 'max-w-sm'}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                        {subtitle && (
                            <p className="mt-1 text-sm leading-5 text-ink/55">{subtitle}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="-m-1 shrink-0 rounded-full p-1.5 text-ink/40 hover:bg-sage hover:text-ink"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

export function ConfirmArchiveDialog({
    itemLabel,
    itemName,
    onConfirm,
    close,
}: {
    itemLabel: string;
    itemName: string;
    onConfirm: () => Promise<void>;
    close: () => void;
}) {
    const [busy, setBusy] = useState(false);
    return (
        <Modal
            title={`Archive this ${itemLabel}?`}
            subtitle={`"${itemName}" will be hidden from your active ${itemLabel}s. You can restore it later.`}
            close={close}
        >
            <div className="grid gap-2.5">
                <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                        setBusy(true);
                        await onConfirm();
                        close();
                    }}
                    className="rounded-xl bg-coral p-2.5 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:opacity-60"
                >
                    {busy ? 'Archiving…' : `Archive ${itemLabel}`}
                </button>
                <button
                    type="button"
                    onClick={close}
                    className="rounded-xl border border-ink/15 p-2.5 text-sm font-semibold text-ink/70 hover:bg-sage/50"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
}
