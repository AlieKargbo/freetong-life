import { useState, type CSSProperties, type ReactNode } from 'react';
import {
    FABRIC_COLORS,
    FABRICS,
    HAIR,
    HAIR_COLORS,
    HAIR_EMOJI,
    OUTFITS,
    OUTFIT_EMOJI,
    SKINS,
    PERSONALITY_TRAITS,
    DREAMS,
    BIRTH_OUTCOMES,
    HOMES,
    type Body,
    type SimAppearance,
} from './CharacterData';

type UpdateAppearance = <K extends keyof SimAppearance>(key: K, value: SimAppearance[K]) => void;

type AsideProps = {
    appearance: SimAppearance;
    signupUsername: string;
    step: number;
    update: UpdateAppearance;
    randomize: () => void;

    traits: string[];
    toggleTrait: (trait: string) => void;

    dream: string;
    setDream: (value: string) => void;

    birthOutcome: string;
    setBirthOutcome: (value: string) => void;

    home: string;
    setHome: (value: string) => void;

    continueStep: () => void;
    finish: () => void;
    canContinue: boolean;
    isMovingIn: boolean;
    moveInError: string;
};


function Choice<T extends string>({ value, selected, onClick, children }: {
    value: T;
    selected: T;
    onClick: (value: T) => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-pressed={value === selected}
            onClick={() => onClick(value)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${value === selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
        >
            {children}
        </button>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-600">{title}</h3>
            {children}
        </section>
    );
}


export default function Aside({
    appearance,
    signupUsername,
    step,
    update,
    randomize,
    traits,
    toggleTrait,
    dream,
    setDream,
    birthOutcome,
    setBirthOutcome,
    home,
    setHome,
    continueStep,
    finish,
    canContinue,
    isMovingIn,
    moveInError,
}: AsideProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const mobileTop = isExpanded ? '12%' : 'calc(100% - 40px)';

    return (
        <aside
            style={{ '--aside-top': mobileTop } as CSSProperties}
            className="m-3 flex w-[min(38vw,500px)] min-w-80 flex-col overflow-hidden rounded-[30px] bg-white/95 shadow-xl backdrop-blur-xl max-lg:absolute max-lg:inset-x-2 max-lg:bottom-2 max-lg:top-[var(--aside-top)] max-lg:m-0 max-lg:w-auto max-lg:min-w-0 max-sm:rounded-[24px]"
        >
            <button
                type="button"
                aria-label={isExpanded ? 'Collapse character setup panel' : 'Expand character setup panel'}
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded(expanded => !expanded)}
                className="hidden h-10 shrink-0 items-center justify-center max-lg:flex"
            >
                <span className="h-1.5 w-12 rounded-full bg-slate-300" />
            </button>
            <div className={`${isExpanded ? '' : 'max-lg:hidden'} flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 pb-4 max-sm:space-y-4 max-sm:p-4 max-sm:pb-3`}>
                {step === 0 && <>
                    <div className="flex items-center rounded-full bg-slate-100 px-4 py-3">
                        <input
                            aria-label="Sim name"
                            value={appearance.name}
                            onChange={event => update('name', event.target.value.slice(0, 24))}
                            placeholder={signupUsername || '@paaka'}
                            className="w-full bg-transparent font-extrabold outline-none"
                            readOnly={!!signupUsername}
                        />
                        <span className="shrink-0 text-sm text-slate-400">your Sim's name</span>
                    </div>
                    <Section title="Body">
                        <div className="grid grid-cols-2 gap-2">
                            {(['Woman', 'Man'] as Body[]).map(value => (
                                <Choice key={value} value={value} selected={appearance.body} onClick={next => update('body', next)}>
                                    {value}
                                </Choice>
                            ))}
                        </div>
                    </Section>
                    <Section title="Hairstyle">
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {HAIR.map(value => (
                                <button key={value} type="button" onClick={() => update('hairstyle', value)} className={`flex min-h-18.75 flex-col items-center justify-center rounded-2xl border-2 p-2 text-xs font-semibold ${appearance.hairstyle === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-slate-100'}`}>
                                    <span className="mb-1 text-2xl">{HAIR_EMOJI[value]}</span>{value}
                                </button>
                            ))}
                        </div>
                    </Section>
                    <Section title="Outfit">
                        <div className="grid grid-cols-3 gap-2">
                            {OUTFITS.map(value => (
                                <button key={value} type="button" onClick={() => update('outfit', value)} className={`flex min-h-18.75 flex-col items-center justify-center rounded-2xl border-2 p-2 text-xs font-semibold ${appearance.outfit === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-slate-100'}`}>
                                    <span className="mb-1 text-2xl">{OUTFIT_EMOJI[value]}</span>{value}
                                </button>
                            ))}
                        </div>
                    </Section>
                    <Section title="Fabric">
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {FABRICS.map(value => (
                                <button key={value} type="button" onClick={() => update('fabric', value)} className={`flex flex-col gap-1 rounded-2xl border-2 p-1.5 text-[11px] font-semibold ${appearance.fabric === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent bg-slate-100'}`}>
                                    <span className="h-10 w-full rounded-xl" style={{ background: `repeating-linear-gradient(45deg, ${FABRIC_COLORS[value][0]} 0 8px, ${FABRIC_COLORS[value][1]} 8px 13px, ${FABRIC_COLORS[value][2]} 13px 17px)` }} />
                                    {value}
                                </button>
                            ))}
                        </div>
                    </Section>
                    <Section title="Skin tone">
                        <div className="flex flex-wrap gap-2">
                            {SKINS.map(value => (
                                <button key={value} type="button" aria-label={`Skin ${value}`} aria-pressed={appearance.skin === value} onClick={() => update('skin', value)} className={`h-9 w-9 rounded-full border-2 ${appearance.skin === value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white shadow'}`} style={{ backgroundColor: value }} />
                            ))}
                        </div>
                    </Section>
                    <Section title="Hair color">
                        <div className="flex gap-2">
                            {HAIR_COLORS.map(value => (
                                <button key={value} type="button" aria-label={`Hair color ${value}`} aria-pressed={appearance.hairColor === value} onClick={() => update('hairColor', value)} className={`h-8 w-8 rounded-full border-2 ${appearance.hairColor === value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white shadow'}`} style={{ backgroundColor: value }} />
                            ))}
                        </div>
                    </Section>
                </>}

                {step === 1 && (
                    <section className="space-y-4">
                        <p className="text-sm text-slate-500">Choose two traits that shape your Sim&apos;s personality.</p>
                        <div className="space-y-2">
                            {PERSONALITY_TRAITS.map(trait => {
                                const selected = traits.includes(trait.name);
                                const limitReached = traits.length >= 2 && !selected;

                                return (
                                    <button
                                        key={trait.name}
                                        type="button"
                                        aria-pressed={selected}
                                        disabled={limitReached}
                                        onClick={() => toggleTrait(trait.name)}
                                        className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
                                    >
                                        <span className="text-2xl">{trait.emoji}</span>
                                        <span>
                                            <span className="block font-bold text-slate-900">{trait.name}</span>
                                            <span className="mt-1 block text-sm text-slate-500">{trait.description}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400">Selected: {traits.length} / 2</p>
                    </section>
                )}

                {step === 2 && (
                    <section className="space-y-4">
                        <p className="text-sm text-slate-500">
                            What&apos;s {appearance.name || '@paaka'}&apos;s big dream?
                        </p>

                        <div className="space-y-2.5">
                            {DREAMS.map(dreamOption => {
                                const selected = dreamOption.name === dream;

                                return (
                                    <button
                                        key={dreamOption.name}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setDream(dreamOption.name)}
                                        className={`flex w-full items-center gap-3 rounded-[24px] border-2 p-4 text-left transition ${selected
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-transparent bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        <span className="text-2xl">
                                            {dreamOption.emoji}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block font-bold text-slate-900">
                                                {dreamOption.name}
                                            </span>
                                            <span className="mt-1 block text-sm text-slate-500">
                                                {dreamOption.description}
                                            </span>
                                        </span>

                                        {selected && (
                                            <span className="text-emerald-600">✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section className="space-y-5">
                        <p className="text-center text-sm text-slate-500">
                            Every Freetonian is born into something. What was{' '}
                            {appearance.name || '@paaka'} born into?
                        </p>

                        {[
                            {
                                name: 'Money Man Pekin!',
                                emoji: '👶🏿💰',
                                tagline: 'Papa na Big Man en Sabi people den.',
                                benefits: [
                                    'Fully furnished Hill Station flat — Daddy pays the rent',
                                    'Your own car (just buy fuel)',
                                    "Branch Manager at Daddy's friend's bank, from day one",
                                    'SLE 500,000 pocket money',
                                ],
                            },
                            {
                                name: 'Fighter!',
                                emoji: '🏦',
                                tagline: 'Self-made hits different.',
                                benefits: [
                                    'SLE 60,000 Fighter loan to start — repay SLE 12,000 every week',
                                    'Hustle skill starts at 2',
                                    'You learn every skill 25% faster',
                                    'Start in Malama or Congo Cross and work your way to HillStation',
                                ],
                            },
                        ].map(outcome => {
                            const selected = outcome.name === birthOutcome;

                            return (
                                <button
                                    key={outcome.name}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setBirthOutcome(outcome.name)}
                                    className={`w-full overflow-hidden rounded-[28px] border-2 text-left transition ${selected
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-transparent bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className="p-5">
                                        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[28px] bg-gradient-to-br from-amber-200 to-amber-400 text-6xl shadow-lg">
                                            {outcome.emoji}
                                        </div>

                                        <h2 className="mt-5 text-center text-2xl font-extrabold text-slate-900">
                                            {outcome.name}
                                        </h2>

                                        <p className="mt-1 text-center text-sm text-slate-500">
                                            {outcome.tagline}
                                        </p>

                                        <div className="mt-5 space-y-2">
                                            {outcome.benefits.map(benefit => (
                                                <div
                                                    key={benefit}
                                                    className="flex items-start gap-2 rounded-full bg-slate-100 px-3 py-3 text-sm text-slate-700"
                                                >
                                                    <span>✨</span>
                                                    <span>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {selected && (
                                            <p className="mt-4 text-center text-sm font-bold text-emerald-700">
                                                ✓ Selected
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        <p className="text-center text-xs text-slate-400">
                            Your background is decided once. Starting a new life won&apos;t change it.
                        </p>
                    </section>
                )}

                {step === 4 && (
                    <section className="space-y-4">
                        <p className="text-sm text-slate-500">Choose your Sim&apos;s starting home.</p>
                        <div className="space-y-2.5">
                            {HOMES.map(option => {
                                const selected = home === option.name;

                                return (
                                    <button
                                        key={option.name}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setHome(option.name)}
                                        className={`w-full rounded-2xl border-2 p-4 text-left transition ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <h2 className="font-bold text-slate-900">{option.name}</h2>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{option.badge}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">{option.area} · {option.description}</p>
                                        <p className="mt-2 text-xs font-semibold text-slate-600">
                                            Start SLE {option.startingMoney.toLocaleString('en-SL')} · Rent SLE {option.weeklyRent.toLocaleString('en-SL')} / week
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>

            <div className={`${isExpanded ? '' : 'max-lg:hidden'} flex shrink-0 gap-2 border-t border-slate-100 bg-white/90 p-4 max-sm:p-3`}>
                <button
                    type="button"
                    onClick={randomize}
                    title="Randomize"
                    aria-label="Randomize appearance"
                    className="h-14 w-14 shrink-0 rounded-full bg-slate-100 text-xl"
                >
                    ⤨
                </button>

                <button
                    type="button"
                    disabled={!canContinue || isMovingIn}
                    onClick={step === 4 ? finish : continueStep}
                    className="flex-1 rounded-full bg-emerald-500 px-5 py-4 font-extrabold text-white shadow-lg shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isMovingIn ? <span className="inline-flex items-center justify-center gap-2"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Moving in…</span> : step === 3
                        ? 'Choose where to live'
                        : step === 4
                            ? 'Move in'
                            : 'Continue'}
                </button>
            </div>
            {moveInError && <p role="alert" className="shrink-0 px-4 pb-3 text-center text-sm font-medium text-red-600">{moveInError}</p>}

        </aside>
    );
}
