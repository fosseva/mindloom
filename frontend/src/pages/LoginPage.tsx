import { useState } from 'react';
import { Brain, Check, MessageCircle, StickyNote, Target } from 'lucide-react';
import { api } from '../services/apiClient';
import type { User } from '../types';
import { Field } from '../components/Field';

const pillars = [
    { icon: Brain, label: 'Remember', description: 'Recall facts on command.' },
    { icon: MessageCircle, label: 'Explain', description: 'Put ideas in your own words.' },
    { icon: Target, label: 'Apply', description: 'Use ideas in real situations.' },
    { icon: StickyNote, label: 'Note', description: 'Revisit what matters, on schedule.' },
];

export function LoginPage({
    signedOut,
    authenticated,
}: {
    signedOut?: boolean;
    authenticated: (user: User) => void;
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    return (
        <main className="grid min-h-screen bg-paper lg:grid-cols-2">
            <section className="hidden flex-col justify-center gap-10 bg-moss px-14 py-12 text-white lg:flex">
                <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                        <Brain />
                    </span>
                    <div>
                        <p className="text-xl font-semibold tracking-tight">Mindloom</p>
                        <p className="text-sm text-white/70">Working knowledge, practiced</p>
                    </div>
                </div>
                <div className="grid gap-4">
                    {pillars.map(({ icon: Icon, label, description }) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 rounded-2xl bg-white/10 p-4"
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
                                <Icon size={19} />
                            </span>
                            <div>
                                <p className="font-semibold">{label}</p>
                                <p className="text-sm text-white/70">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="grid place-items-center p-5">
                <div className="w-full max-w-md rounded-4xl border border-ink/10 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10 lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                    <span className="grid size-12 place-items-center rounded-2xl bg-moss text-white lg:hidden">
                        <Brain />
                    </span>
                    <h1 className="mt-6 text-3xl font-semibold tracking-tight lg:mt-0">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-ink/55">
                        Sign in to continue building knowledge you can recall, explain, and apply.
                    </p>
                    {signedOut && (
                        <p
                            role="status"
                            className="mt-5 flex items-center gap-2 rounded-xl bg-sage/70 px-4 py-3 text-sm font-semibold text-moss"
                        >
                            <Check size={16} /> You've been signed out.
                        </p>
                    )}
                    <form
                        className="mt-7 grid gap-5"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            setBusy(true);
                            setError('');
                            try {
                                authenticated((await api.login(email, password)).data);
                            } catch (reason) {
                                setError(
                                    reason instanceof Error ? reason.message : 'Unable to sign in.',
                                );
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        <Field
                            label="Email"
                            value={email}
                            setValue={setEmail}
                            required
                            type="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <Field
                            label="Password"
                            value={password}
                            setValue={setPassword}
                            required
                            type="password"
                            autoComplete="current-password"
                        />
                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral"
                            >
                                {error}
                            </p>
                        )}
                        <button
                            disabled={busy}
                            className="rounded-xl bg-moss px-4 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-wait disabled:opacity-60"
                        >
                            {busy ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
