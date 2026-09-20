import { useEffect, useState } from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import { ApiError, api } from '../services/apiClient';
import type { User } from '../types';
import { LoginPage } from '../pages/LoginPage';
import { Workspace } from '../features/workspace/Workspace';
import { replacePath } from './router';

type AuthState =
    | { status: 'checking' }
    | { status: 'guest' }
    | { status: 'authenticated'; user: User }
    | { status: 'error'; message: string };

export function App() {
    const [auth, setAuth] = useState<AuthState>({ status: 'checking' });
    const [justSignedOut, setJustSignedOut] = useState(false);

    const checkSession = async () => {
        setAuth({ status: 'checking' });

        try {
            const { data } = await api.user();
            setAuth({ status: 'authenticated', user: data });
            if (
                !['/dashboard', '/decks', '/learn', '/profile'].includes(window.location.pathname)
            ) {
                replacePath('/dashboard');
            }
        } catch (reason) {
            if (reason instanceof ApiError && reason.status === 401) {
                setAuth({ status: 'guest' });
                replacePath('/login');
                return;
            }

            setAuth({
                status: 'error',
                message: reason instanceof Error ? reason.message : 'Unable to check your session.',
            });
        }
    };

    useEffect(() => {
        void checkSession();
    }, []);

    if (auth.status === 'checking') {
        return <SessionCheck />;
    }

    if (auth.status === 'guest') {
        return (
            <LoginPage
                signedOut={justSignedOut}
                authenticated={(user) => {
                    setJustSignedOut(false);
                    setAuth({ status: 'authenticated', user });
                    replacePath('/dashboard');
                }}
            />
        );
    }

    if (auth.status === 'error') {
        return <SessionError message={auth.message} retry={checkSession} />;
    }

    return (
        <Workspace
            user={auth.user}
            userUpdated={(user) => setAuth({ status: 'authenticated', user })}
            loggedOut={() => {
                setJustSignedOut(true);
                setAuth({ status: 'guest' });
                replacePath('/login');
            }}
        />
    );
}

function SessionCheck() {
    return (
        <main className="grid min-h-screen place-items-center bg-paper">
            <div className="flex items-center gap-3 text-moss">
                <Brain className="animate-pulse" />
                <span className="font-semibold">Opening Mindloom…</span>
            </div>
        </main>
    );
}

function SessionError({ message, retry }: { message: string; retry: () => Promise<void> }) {
    return (
        <main className="grid min-h-screen place-items-center bg-paper p-5">
            <div className="grid max-w-md justify-items-center gap-4 rounded-3xl border border-ink/10 bg-white/85 p-8 text-center shadow-xl">
                <span className="grid size-12 place-items-center rounded-2xl bg-coral/10 text-coral">
                    <Brain />
                </span>
                <div className="grid gap-2">
                    <h1 className="text-xl font-semibold">Mindloom couldn't open</h1>
                    <p role="alert" className="text-sm leading-6 text-ink/55">
                        {message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void retry()}
                    className="flex items-center gap-2 rounded-xl bg-moss px-4 py-3 font-semibold text-white transition hover:bg-ink"
                >
                    <RefreshCw size={16} /> Try again
                </button>
            </div>
        </main>
    );
}
