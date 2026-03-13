"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── Country code directory ───────────────────────────────────────────────────
export const COUNTRY_CODES = [
    // ── India first (default) ──
    { code: "+91", flag: "🇮🇳", name: "India" },

    // ── Asia ──
    { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
    { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
    { code: "+975", flag: "🇧🇹", name: "Bhutan" },
    { code: "+673", flag: "🇧🇳", name: "Brunei" },
    { code: "+855", flag: "🇰🇭", name: "Cambodia" },
    { code: "+86", flag: "🇨🇳", name: "China" },
    { code: "+62", flag: "🇮🇩", name: "Indonesia" },
    { code: "+98", flag: "🇮🇷", name: "Iran" },
    { code: "+964", flag: "🇮🇶", name: "Iraq" },
    { code: "+972", flag: "🇮🇱", name: "Israel" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+962", flag: "🇯🇴", name: "Jordan" },
    { code: "+7", flag: "🇰🇿", name: "Kazakhstan" },
    { code: "+965", flag: "🇰🇼", name: "Kuwait" },
    { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan" },
    { code: "+856", flag: "🇱🇦", name: "Laos" },
    { code: "+961", flag: "🇱🇧", name: "Lebanon" },
    { code: "+60", flag: "🇲🇾", name: "Malaysia" },
    { code: "+960", flag: "🇲🇻", name: "Maldives" },
    { code: "+976", flag: "🇲🇳", name: "Mongolia" },
    { code: "+95", flag: "🇲🇲", name: "Myanmar" },
    { code: "+977", flag: "🇳🇵", name: "Nepal" },
    { code: "+850", flag: "🇰🇵", name: "North Korea" },
    { code: "+968", flag: "🇴🇲", name: "Oman" },
    { code: "+92", flag: "🇵🇰", name: "Pakistan" },
    { code: "+970", flag: "🇵🇸", name: "Palestine" },
    { code: "+63", flag: "🇵🇭", name: "Philippines" },
    { code: "+974", flag: "🇶🇦", name: "Qatar" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+65", flag: "🇸🇬", name: "Singapore" },
    { code: "+82", flag: "🇰🇷", name: "South Korea" },
    { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
    { code: "+963", flag: "🇸🇾", name: "Syria" },
    { code: "+886", flag: "🇹🇼", name: "Taiwan" },
    { code: "+992", flag: "🇹🇯", name: "Tajikistan" },
    { code: "+66", flag: "🇹🇭", name: "Thailand" },
    { code: "+993", flag: "🇹🇲", name: "Turkmenistan" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+998", flag: "🇺🇿", name: "Uzbekistan" },
    { code: "+84", flag: "🇻🇳", name: "Vietnam" },
    { code: "+967", flag: "🇾🇪", name: "Yemen" },

    // ── Middle East / North Africa ──
    { code: "+973", flag: "🇧🇭", name: "Bahrain" },
    { code: "+20", flag: "🇪🇬", name: "Egypt" },
    { code: "+212", flag: "🇲🇦", name: "Morocco" },
    { code: "+216", flag: "🇹🇳", name: "Tunisia" },
    { code: "+213", flag: "🇩🇿", name: "Algeria" },
    { code: "+218", flag: "🇱🇾", name: "Libya" },

    // ── Europe ──
    { code: "+355", flag: "🇦🇱", name: "Albania" },
    { code: "+43", flag: "🇦🇹", name: "Austria" },
    { code: "+375", flag: "🇧🇾", name: "Belarus" },
    { code: "+32", flag: "🇧🇪", name: "Belgium" },
    { code: "+387", flag: "🇧🇦", name: "Bosnia & Herzegovina" },
    { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
    { code: "+385", flag: "🇭🇷", name: "Croatia" },
    { code: "+357", flag: "🇨🇾", name: "Cyprus" },
    { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
    { code: "+45", flag: "🇩🇰", name: "Denmark" },
    { code: "+372", flag: "🇪🇪", name: "Estonia" },
    { code: "+358", flag: "🇫🇮", name: "Finland" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+30", flag: "🇬🇷", name: "Greece" },
    { code: "+36", flag: "🇭🇺", name: "Hungary" },
    { code: "+354", flag: "🇮🇸", name: "Iceland" },
    { code: "+353", flag: "🇮🇪", name: "Ireland" },
    { code: "+39", flag: "🇮🇹", name: "Italy" },
    { code: "+371", flag: "🇱🇻", name: "Latvia" },
    { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
    { code: "+370", flag: "🇱🇹", name: "Lithuania" },
    { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
    { code: "+356", flag: "🇲🇹", name: "Malta" },
    { code: "+373", flag: "🇲🇩", name: "Moldova" },
    { code: "+382", flag: "🇲🇪", name: "Montenegro" },
    { code: "+31", flag: "🇳🇱", name: "Netherlands" },
    { code: "+47", flag: "🇳🇴", name: "Norway" },
    { code: "+48", flag: "🇵🇱", name: "Poland" },
    { code: "+351", flag: "🇵🇹", name: "Portugal" },
    { code: "+40", flag: "🇷🇴", name: "Romania" },
    { code: "+7", flag: "🇷🇺", name: "Russia" },
    { code: "+381", flag: "🇷🇸", name: "Serbia" },
    { code: "+421", flag: "🇸🇰", name: "Slovakia" },
    { code: "+386", flag: "🇸🇮", name: "Slovenia" },
    { code: "+34", flag: "🇪🇸", name: "Spain" },
    { code: "+46", flag: "🇸🇪", name: "Sweden" },
    { code: "+41", flag: "🇨🇭", name: "Switzerland" },
    { code: "+90", flag: "🇹🇷", name: "Turkey" },
    { code: "+380", flag: "🇺🇦", name: "Ukraine" },
    { code: "+44", flag: "🇬🇧", name: "UK" },

    // ── Americas ──
    { code: "+54", flag: "🇦🇷", name: "Argentina" },
    { code: "+591", flag: "🇧🇴", name: "Bolivia" },
    { code: "+55", flag: "🇧🇷", name: "Brazil" },
    { code: "+1", flag: "🇨🇦", name: "Canada" },
    { code: "+56", flag: "🇨🇱", name: "Chile" },
    { code: "+57", flag: "🇨🇴", name: "Colombia" },
    { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
    { code: "+53", flag: "🇨🇺", name: "Cuba" },
    { code: "+593", flag: "🇪🇨", name: "Ecuador" },
    { code: "+503", flag: "🇸🇻", name: "El Salvador" },
    { code: "+502", flag: "🇬🇹", name: "Guatemala" },
    { code: "+504", flag: "🇭🇳", name: "Honduras" },
    { code: "+52", flag: "🇲🇽", name: "Mexico" },
    { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
    { code: "+507", flag: "🇵🇦", name: "Panama" },
    { code: "+595", flag: "🇵🇾", name: "Paraguay" },
    { code: "+51", flag: "🇵🇪", name: "Peru" },
    { code: "+787", flag: "🇵🇷", name: "Puerto Rico" },
    { code: "+1", flag: "🇺🇸", name: "USA" },
    { code: "+598", flag: "🇺🇾", name: "Uruguay" },
    { code: "+58", flag: "🇻🇪", name: "Venezuela" },

    // ── Africa ──
    { code: "+244", flag: "🇦🇴", name: "Angola" },
    { code: "+237", flag: "🇨🇲", name: "Cameroon" },
    { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
    { code: "+243", flag: "🇨🇩", name: "DR Congo" },
    { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+231", flag: "🇱🇷", name: "Liberia" },
    { code: "+261", flag: "🇲🇬", name: "Madagascar" },
    { code: "+265", flag: "🇲🇼", name: "Malawi" },
    { code: "+223", flag: "🇲🇱", name: "Mali" },
    { code: "+222", flag: "🇲🇷", name: "Mauritania" },
    { code: "+230", flag: "🇲🇺", name: "Mauritius" },
    { code: "+258", flag: "🇲🇿", name: "Mozambique" },
    { code: "+264", flag: "🇳🇦", name: "Namibia" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "+221", flag: "🇸🇳", name: "Senegal" },
    { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
    { code: "+252", flag: "🇸🇴", name: "Somalia" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+211", flag: "🇸🇸", name: "South Sudan" },
    { code: "+249", flag: "🇸🇩", name: "Sudan" },
    { code: "+255", flag: "🇹🇿", name: "Tanzania" },
    { code: "+228", flag: "🇹🇬", name: "Togo" },
    { code: "+256", flag: "🇺🇬", name: "Uganda" },
    { code: "+260", flag: "🇿🇲", name: "Zambia" },
    { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },

    // ── Oceania ──
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+679", flag: "🇫🇯", name: "Fiji" },
    { code: "+64", flag: "🇳🇿", name: "New Zealand" },
    { code: "+675", flag: "🇵🇬", name: "Papua New Guinea" },
    { code: "+685", flag: "🇼🇸", name: "Samoa" },
    { code: "+677", flag: "🇸🇧", name: "Solomon Islands" },
    { code: "+676", flag: "🇹🇴", name: "Tonga" },
];

const DEFAULT_CODE = "+91";

/** Parse a stored phone string like "+91 9876543210" into { code, number } */
function parsePhone(value: string | null | undefined): { code: string; number: string } {
    if (!value || value.trim() === "") return { code: DEFAULT_CODE, number: "" };

    const trimmed = value.trim();

    // Try to match a known prefix (longest first to avoid "+1" eating "+91" etc.)
    const sortedCodes = [...COUNTRY_CODES]
        .sort((a, b) => b.code.length - a.code.length)
        .map(c => c.code);

    for (const code of sortedCodes) {
        if (trimmed.startsWith(code + " ") || trimmed.startsWith(code + "-")) {
            return { code, number: trimmed.slice(code.length + 1).trim() };
        }
        if (trimmed.startsWith(code)) {
            const rest = trimmed.slice(code.length).trim();
            if (/^\d{10}$/.test(rest)) return { code, number: rest };
        }
    }

    // No prefix found → keep default code, treat whole string as number
    return { code: DEFAULT_CODE, number: trimmed.replace(/\D/g, "").slice(0, 10) };
}

// ─── Component ────────────────────────────────────────────────────────────────
export interface PhoneInputProps {
    label?: string;
    /** Combined value e.g. "+91 9876543210". onChange returns the same format. */
    value: string;
    onChange?: (combined: string) => void;
    readOnly?: boolean;
    disabled?: boolean;
    error?: string | null;
    className?: string;
}

export function PhoneInput({ label, value, onChange, readOnly = false, disabled = false, error, className }: PhoneInputProps) {
    // Separate value into country code and number
    const [countryCode, phoneNumber] = value.includes(" ")
        ? value.split(" ")
        : ["+91", value.replace(/\D/g, "")];

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!readOnly && !disabled && onChange) {
            onChange(`${e.target.value} ${phoneNumber}`);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!readOnly && !disabled && onChange) {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(`${countryCode} ${digits}`);
        }
    };

    const countryEntry = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];
    const hasValue = !!phoneNumber;

    if (readOnly) {
        return (
            <div className={cn("space-y-2", className)}>
                {label && <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>}
                {hasValue ? (
                    <div className="flex gap-3">
                        <div className="bg-zinc-50 border-0 rounded-2xl py-4 px-4 font-bold text-zinc-500 opacity-75 min-w-[100px] text-center">
                            {countryEntry.flag} {countryCode}
                        </div>
                        <div className="flex-1 bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-zinc-500 opacity-75 tracking-widest">
                            {phoneNumber}
                        </div>
                    </div>
                ) : (
                    <div className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 text-zinc-300 text-lg font-light select-none">
                        —
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", error ? "text-red-500" : "text-zinc-400")}>
                    {label}{error ? " *" : ""}
                </label>
            )}
            <div className="flex gap-3">
                {/* Country code selector - Separate Field */}
                <div className={cn(
                    "relative rounded-2xl border-2 bg-white transition-all focus-within:ring-2 min-w-[110px]",
                    error ? "border-red-400 ring-2 ring-red-100" : "border-zinc-100 focus-within:ring-zinc-200",
                    (disabled) && "opacity-50 cursor-not-allowed bg-zinc-50"
                )}>
                    <select
                        value={countryCode}
                        onChange={handleCountryChange}
                        disabled={disabled}
                        title="Country code"
                        className="w-full bg-transparent py-4 pl-4 pr-8 font-bold text-zinc-700 text-sm focus:outline-none cursor-pointer appearance-none disabled:cursor-not-allowed"
                    >
                        {COUNTRY_CODES.map(c => (
                            <option key={`${c.code}-${c.name}`} value={c.code}>
                                {c.flag} {c.code}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 1L5 5L9 1" />
                        </svg>
                    </div>
                </div>

                {/* 10-digit number - Separate Field */}
                <div className={cn(
                    "flex-1 flex items-center rounded-2xl border-2 bg-white overflow-hidden transition-all focus-within:ring-2",
                    error ? "border-red-400 ring-2 ring-red-100 focus-within:ring-red-200" : "border-zinc-100 focus-within:ring-zinc-200",
                    (disabled) && "opacity-50 cursor-not-allowed bg-zinc-50"
                )}>
                    <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit number"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        disabled={disabled}
                        maxLength={10}
                        className="flex-1 bg-white py-4 px-4 font-bold text-zinc-900 text-sm focus:outline-none placeholder:text-zinc-300 placeholder:font-normal disabled:cursor-not-allowed"
                    />
                    {/* Digit counter */}
                    <span className={cn(
                        "pr-4 text-[10px] font-black tabular-nums",
                        phoneNumber.length === 10 ? "text-emerald-500" : "text-zinc-300"
                    )}>
                        {phoneNumber.length}/10
                    </span>
                </div>
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 px-1">{error}</p>}
        </div>
    );
}
