import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { api } from '../services/apiClient';
import type { User } from '../types';
import { LoginPage } from '../pages/LoginPage';
import { Workspace } from '../features/workspace/Workspace';
import { replacePath } from './router';

type AuthState =
    { status: 'checking' } | { status: 'guest' } | { status: 'authenticated'; user: User };

export function App() {
    const [auth, setAuth] = useState<AuthState>({ status: 'checking' });
    const [justSignedOut, setJustSignedOut] = useState(false);

    useEffect(() => {
        api.user()
            .then(({ data }) => {
                setAuth({ status: 'authenticated', user: data });
                replacePath('/dashboard');
            })
            .catch(() => {
                setAuth({ status: 'guest' });
                replacePath('/login');
            });
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

    return (
        <Workspace
            user={auth.user}
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
