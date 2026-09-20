import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type FieldProps = {
    label: string;
    value: string;
    setValue: (value: string) => void;
    required?: boolean;
    multiline?: boolean;
    placeholder?: string;
    hint?: string;
    type?: string;
    autoComplete?: string;
    autoFocus?: boolean;
};
export function Field({
    label,
    value,
    setValue,
    required,
    multiline,
    placeholder,
    hint,
    type,
    autoComplete,
    autoFocus,
}: FieldProps) {
    const [reveal, setReveal] = useState(false);
    const isPassword = type === 'password';
    const className =
        'rounded-xl border border-ink/15 bg-white p-2.5 font-normal outline-none focus:border-moss focus:ring-3 focus:ring-moss/10';
    return (
        <label className="grid gap-1.5 text-sm font-semibold">
            <span>
                {label}
                {hint && (
                    <span className="mt-0.5 block text-xs font-normal text-ink/45">{hint}</span>
                )}
            </span>
            {multiline ? (
                <textarea
                    required={required}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={placeholder}
                    className={`${className} min-h-20`}
                />
            ) : isPassword ? (
                <div className="relative">
                    <input
                        required={required}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder={placeholder}
                        type={reveal ? 'text' : 'password'}
                        autoComplete={autoComplete}
                        autoFocus={autoFocus}
                        className={`${className} w-full pr-11`}
                    />
                    <button
                        type="button"
                        onClick={() => setReveal((current) => !current)}
                        aria-label={reveal ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-1.5 grid place-items-center px-2 text-ink/40 hover:text-ink"
                    >
                        {reveal ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
            ) : (
                <input
                    required={required}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={placeholder}
                    type={type}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    className={className}
                />
            )}
        </label>
    );
}
