export const MOCK_AI_DATA = {
    SCORE_BANDS: {
        HOT: { min: 80, max: 100, label: "HOT", color: "bg-red-100 text-red-700 ring-red-200", icon: "🔥" },
        WARM: { min: 60, max: 79, label: "WARM", color: "bg-orange-100 text-orange-700 ring-orange-200", icon: "🌤" },
        COOL: { min: 40, max: 59, label: "COOL", color: "bg-blue-100 text-blue-700 ring-blue-200", icon: "🌱" },
        COLD: { min: 0, max: 39, label: "COLD", color: "bg-zinc-100 text-zinc-500 ring-zinc-200", icon: "❄" }
    },
    RISKS: {
        IDLE_HOT: { label: "Hot Lead Idle > 24h", severity: "HIGH" },
        MISSED_FOLLOWUP: { label: "Missed Follow-up", severity: "MEDIUM" },
        SENTIMENT_DROP: { label: "Negative Sentiment Detected", severity: "HIGH" }
    },
    NBAs: [
        { id: '1', type: 'CALL', label: 'Call Parent (Lunch Break)', reason: 'Usually picks up at 1 PM' },
        { id: '2', type: 'WHATSAPP', label: 'Send Brochure', reason: 'Requested details in last call' },
        { id: '3', type: 'TOUR', label: 'Invite for Tour', reason: 'High interest signal detected' },
        { id: '4', type: 'FEE', label: 'Send Fee Structure', reason: 'Mentioned budget concern' }
    ]
};
