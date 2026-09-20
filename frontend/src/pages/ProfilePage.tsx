import { useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { Field } from '../components/Field';
import { api } from '../services/apiClient';
import type { User } from '../types';

export function ProfileScreen({
    user,
    userUpdated,
}: {
    user: User;
    userUpdated: (user: User) => void;
}) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [profileBusy, setProfileBusy] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSaved, setProfileSaved] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordBusy, setPasswordBusy] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSaved, setPasswordSaved] = useState(false);

    return (
        <div className="mx-auto max-w-5xl">
            <div className="flex items-start gap-3 sm:gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-moss text-white sm:size-14">
                    <UserRound size={24} />
                </span>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-moss sm:text-xs">
                        Account
                    </p>
                    <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-4xl">
                        Profile settings
                    </h1>
                    <p className="mt-1 text-sm leading-5 text-ink/55 sm:mt-2 sm:text-base">
                        Keep your account details and sign-in credentials up to date.
                    </p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:items-start lg:gap-6">
                <section className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-sm sm:rounded-3xl sm:p-7">
                    <SectionHeading
                        icon={<UserRound size={19} />}
                        title="Personal information"
                        description="Used to identify your account."
                    />
                    <form
                        className="mt-5 grid gap-4"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            setProfileBusy(true);
                            setProfileError('');
                            setProfileSaved(false);

                            try {
                                const result = await api.updateProfile({ name, email });
                                userUpdated(result.data);
                                setName(result.data.name);
                                setEmail(result.data.email);
                                setProfileSaved(true);
                            } catch (reason) {
                                setProfileError(
                                    reason instanceof Error
                                        ? reason.message
                                        : 'Unable to update your profile.',
                                );
                            } finally {
                                setProfileBusy(false);
                            }
                        }}
                    >
                        <Field
                            label="Full name"
                            value={name}
                            setValue={setName}
                            required
                            autoComplete="name"
                        />
                        <Field
                            label="Email address"
                            value={email}
                            setValue={setEmail}
                            required
                            type="email"
                            autoComplete="email"
                        />
                        {profileError && <ErrorMessage message={profileError} />}
                        {profileSaved && (
                            <SuccessMessage icon={<CheckCircle2 size={16} />}>
                                Profile updated.
                            </SuccessMessage>
                        )}
                        <button
                            disabled={profileBusy}
                            className="rounded-xl bg-moss px-4 py-3 font-semibold text-white transition hover:bg-ink disabled:opacity-60 sm:justify-self-start sm:px-6"
                        >
                            {profileBusy ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-sm sm:rounded-3xl sm:p-7">
                    <SectionHeading
                        icon={<KeyRound size={19} />}
                        title="Change password"
                        description="Use at least 8 characters."
                        amber
                    />
                    <form
                        className="mt-5 grid gap-4"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            setPasswordBusy(true);
                            setPasswordError('');
                            setPasswordSaved(false);

                            try {
                                await api.updatePassword({
                                    current_password: currentPassword,
                                    password,
                                    password_confirmation: passwordConfirmation,
                                });
                                setCurrentPassword('');
                                setPassword('');
                                setPasswordConfirmation('');
                                setPasswordSaved(true);
                            } catch (reason) {
                                setPasswordError(
                                    reason instanceof Error
                                        ? reason.message
                                        : 'Unable to change your password.',
                                );
                            } finally {
                                setPasswordBusy(false);
                            }
                        }}
                    >
                        <Field
                            label="Current password"
                            value={currentPassword}
                            setValue={setCurrentPassword}
                            required
                            type="password"
                            autoComplete="current-password"
                        />
                        <Field
                            label="New password"
                            value={password}
                            setValue={setPassword}
                            required
                            type="password"
                            autoComplete="new-password"
                        />
                        <Field
                            label="Confirm new password"
                            value={passwordConfirmation}
                            setValue={setPasswordConfirmation}
                            required
                            type="password"
                            autoComplete="new-password"
                        />
                        {passwordError && <ErrorMessage message={passwordError} />}
                        {passwordSaved && (
                            <SuccessMessage icon={<ShieldCheck size={16} />}>
                                Password changed securely.
                            </SuccessMessage>
                        )}
                        <button
                            disabled={passwordBusy}
                            className="rounded-xl border border-moss bg-white px-4 py-3 font-semibold text-moss transition hover:bg-sage/60 disabled:opacity-60 sm:justify-self-start sm:px-6"
                        >
                            {passwordBusy ? 'Updating…' : 'Update password'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

function SectionHeading({
    icon,
    title,
    description,
    amber = false,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    amber?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`grid size-10 place-items-center rounded-xl ${amber ? 'bg-amber/15 text-amber' : 'bg-sage text-moss'}`}
            >
                {icon}
            </span>
            <div>
                <h2 className="font-semibold sm:text-lg">{title}</h2>
                <p className="text-xs text-ink/50 sm:text-sm">{description}</p>
            </div>
        </div>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {message}
        </p>
    );
}

function SuccessMessage({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <p
            role="status"
            className="flex items-center gap-2 rounded-xl bg-sage/70 px-4 py-3 text-sm font-semibold text-moss"
        >
            {icon} {children}
        </p>
    );
}
