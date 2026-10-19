
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Eye, EyeOff } from 'lucide-react';
import {
    AUTH_STORAGE_KEY,
    PLAYER_USERNAME_STORAGE_KEY,
    game,
} from '../utils/Store';

type AuthPageProps = {
    mode: 'signup' | 'login';
};

export default function AuthPage({ mode }: AuthPageProps) {
    const router = useRouter();
    const isSignup = mode === 'signup';
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [today, setToday] = useState('');

    useEffect(() => {
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset());
        setToday(currentDate.toISOString().slice(0, 10));
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage('');
        setSubmitting(true);

        const form = new FormData(event.currentTarget);
        const password = String(form.get('password') ?? '');
        let result: { ok: boolean; username?: string; error?: string };

        try {
            if (isSignup) {
                const confirmPassword = String(form.get('confirmPassword') ?? '');
                if (password !== confirmPassword) {
                    setMessage('Your passwords do not match.');
                    setSubmitting(false);
                    return;
                }
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operation: 'signup',
                        username: String(form.get('username') ?? ''),
                        displayName: String(form.get('name') ?? ''),
                        email: String(form.get('email') ?? ''),
                        password,
                        dateOfBirth: String(form.get('dateOfBirth') ?? ''),
                    }),
                });
                const data = await response.json();
                result = response.ok
                    ? { ok: true, username: data.username }
                    : { ok: false, error: data.error ?? 'Could not create your account.' };
            } else {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        operation: 'login',
                        identifier: String(form.get('username') ?? ''),
                        password,
                    }),
                });
                const data = await response.json();
                result = response.ok
                    ? { ok: true, username: data.username }
                    : { ok: false, error: data.error ?? 'Could not sign in.' };
            }
        } catch {
            setMessage('Could not reach the game server. Check that the app and database are running.');
            setSubmitting(false);
            return;
        }

        if (!result.ok) {
            setMessage(result.error ?? 'Authentication failed.');
            setSubmitting(false);
            return;
        }

        game.setPlayerUsername(result.username!);
        game.setAuthenticated(true);
        try {
            localStorage.setItem(PLAYER_USERNAME_STORAGE_KEY, result.username!);
            localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        } catch {
            // Keep the in-memory session active if browser storage is unavailable.
        }

        if (isSignup) {
            router.push('/character');
        } else {
            let hasCharacter = false;
            try {
                hasCharacter = Boolean(localStorage.getItem('freetown-life-player-appearance'));
            } catch {
                // Send players without a restorable character through creation.
            }
            try {
                const response = await fetch('/api/player/save', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    const save = data.save;
                    if (save?.player && typeof save.player === 'object') {
                        const setup = save.characterSetup ?? {};
                        const choices = {
                            appearance: save.player,
                            traits: Array.isArray(setup.traits) ? setup.traits : [],
                            dream: typeof save.dream === 'string' ? save.dream : '',
                            birthOutcome: typeof setup.birthOutcome === 'string' ? setup.birthOutcome : '',
                            home: typeof setup.home === 'string' ? setup.home : '',
                        };
                        const customization = {
                            Look: choices.appearance,
                            Personality: choices.traits,
                            Dream: choices.dream,
                            'Birth Lottery': choices.birthOutcome,
                            Home: choices.home,
                        };
                        try {
                            localStorage.setItem('freetown-life-player-appearance', JSON.stringify(choices.appearance));
                            localStorage.setItem('freetown-life-player-choices', JSON.stringify(choices));
                            localStorage.setItem('freetown-life-player-customization', JSON.stringify(customization));
                        } catch {
                            // The server save remains available even if browser storage is disabled.
                        }
                        hasCharacter = true;
                    }
                }
            } catch {
                // Continue with the local character if the database is unavailable.
            }
            router.replace(hasCharacter ? '/' : '/character');
        }
    }

    const inputClass =
        'w-full rounded-full border border-transparent bg-[#f1f3f8] px-5 py-3.5 text-base text-slate-800 outline-none transition placeholder:text-[#8995ad] focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:text-[17px]';

    const labelClass = 'mb-2 block text-[15px] font-medium text-[#465777]';

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#c2e2f8] via-[#e2eef5] to-[#edf1f5] px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
            <Link
                href="/"
                className="absolute left-5 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800 sm:left-7 sm:top-8 sm:text-base"
            >
                <ArrowLeft size={19} />
                Back to the city
            </Link>

            <div className="mx-auto w-full max-w-[560px]">
                {/* Brand */}
                <header className="mb-8 pt-14 text-center sm:mb-10 sm:pt-12">
                    <div
                        aria-hidden="true"
                        className="mb-2 flex justify-center text-5xl"
                    >
                        <Crown
                            size={52}
                            strokeWidth={1.7}
                            className="text-amber-500"
                            fill="#facc55"
                        />
                    </div>

                    <h1 className="flex items-center justify-center gap-2 text-4xl font-black tracking-tight text-[#182033] sm:text-5xl">
                        Freetown Life
                        <span className="relative top-1 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#182033] px-1.5 text-[11px] font-extrabold text-white sm:h-9 sm:min-w-9">
                            18+
                        </span>
                    </h1>

                    <p className="mt-2 text-base text-[#63738e] sm:text-lg">
                        Live your Freetown story with real people.
                    </p>
                </header>

                {/* Authentication card */}
                <section className="rounded-[30px] border border-white/80 bg-white/95 p-5 shadow-[0_18px_60px_rgba(54,86,116,0.13)] sm:p-7 md:p-8">
                    {/* Tabs */}
                    <div
                        role="tablist"
                        aria-label="Authentication"
                        className="mb-7 grid grid-cols-2 rounded-full bg-[#f1f3f8] p-1"
                    >
                        <Link
                            href="/signup"
                            role="tab"
                            aria-selected={isSignup}
                            className={`flex min-h-12 items-center justify-center rounded-full px-3 text-sm font-semibold transition sm:text-base ${isSignup
                                ? 'bg-white text-[#172033] shadow-sm ring-1 ring-slate-900/5'
                                : 'text-[#53627f] hover:text-slate-950'
                                }`}
                        >
                            Create account
                        </Link>

                        <Link
                            href="/login"
                            role="tab"
                            aria-selected={!isSignup}
                            className={`flex min-h-12 items-center justify-center rounded-full px-3 text-sm font-semibold transition sm:text-base ${!isSignup
                                ? 'bg-white text-[#172033] shadow-sm ring-1 ring-slate-900/5'
                                : 'text-[#53627f] hover:text-slate-950'
                                }`}
                        >
                            Log in
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isSignup && (
                            <div>
                                <label htmlFor="loginUsername" className={labelClass}>
                                    Username
                                </label>
                                <input
                                    id="loginUsername"
                                    name="username"
                                    autoComplete="username"
                                    placeholder="Enter your username or email"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        )}

                        {isSignup && (
                            <>
                                <div>
                                    <label htmlFor="name" className={labelClass}>
                                        Your name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        autoComplete="name"
                                        placeholder="e.g. Aki Kamara"
                                        required
                                        maxLength={80}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" className={labelClass}>
                                        Username
                                    </label>

                                    <div className="flex items-center rounded-full bg-[#f1f3f8] px-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-600/10">
                                        <span aria-hidden="true" className="text-base text-[#8995ad] sm:text-[17px]">@</span>
                                        <input
                                            id="username"
                                            name="username"
                                            autoComplete="username"
                                            placeholder="aminata"
                                            pattern="[A-Za-z0-9_]{3,20}"
                                            title="Use 3–20 letters, numbers, or underscores."
                                            required
                                            className="min-w-0 flex-1 bg-transparent px-1 py-3.5 text-base text-slate-800 outline-none placeholder:text-[#8995ad] sm:text-[17px]"
                                        />
                                    </div>

                                    <p className="mt-2 text-sm leading-5 text-[#63738e]">
                                        This is your Sim&apos;s name in Freetown Life.
                                    </p>
                                </div>
                            </>
                        )}


                        <label htmlFor="password" className={labelClass}>
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={isSignup ? 'new-password' : 'current-password'}
                                minLength={isSignup ? 8 : undefined}
                                placeholder="Enter your password"
                                required
                                className={`${inputClass} pr-14`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#63718b] hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                            >
                                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                            </button>
                        </div>

                        {isSignup && (
                            <p className="mt-2 text-sm leading-5 text-[#63738e]">
                                At least 8 characters. Not 123456 😅
                            </p>
                        )}


                        {isSignup && (
                            <>
                                <div>
                                    <label htmlFor="confirmPassword" className={labelClass}>
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={8}
                                        placeholder="Enter your password again"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className={labelClass}>
                                        Email (optional)
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@email.com"
                                        className={inputClass}
                                    />
                                    <p className="mt-2 text-sm leading-5 text-[#63738e]">
                                        You can log in with it too. We never send you codes.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="dateOfBirth" className={labelClass}>
                                        Date of birth
                                    </label>
                                    <input
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        type="date"
                                        autoComplete="bday"
                                        required
                                        max={today || undefined}
                                        className={`${inputClass} text-[#63738e]`}
                                    />
                                    <p className="mt-2 text-sm leading-5 text-[#63738e]">
                                        Freetown Life is intended for adults aged 18 and over.
                                    </p>
                                </div>
                            </>
                        )}

                        {message && (
                            <p
                                role="alert"
                                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900"
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-full bg-[#16834a] px-5 py-4 text-base font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-[#116d3d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/25 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
                        >
                            {submitting ? 'Please wait…' : isSignup ? 'Create your account' : 'Log in to Freetown Life'}
                        </button>

                        <p className="pt-1 text-center text-xs leading-5 text-[#8490a5]">
                            Your account is saved securely and your game progress syncs when you sign in.
                        </p>
                    </form>
                </section>

                <footer className="px-3 pb-4 pt-6 text-center text-xs leading-5 text-[#687b94]">
                    By continuing, you agree to follow the community rules of Freetown Life.
                    <br />
                    Your city. Your story.
                </footer>
            </div>
        </main>
    );
}
