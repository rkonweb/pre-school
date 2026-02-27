"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_AI_DATA } from './ai-mock-data';

interface AIContextType {
    getScoreBand: (score: number) => any;
    getNBA: (leadId: string) => any;
    getRisks: (leadId: string) => any[];
    leadIntelligence: Record<string, any>;
    fetchLeadIntelligence: (slug: string, leadId: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
    const [leadIntelligence, setLeadIntelligence] = useState<Record<string, any>>({});

    const getScoreBand = (score: number) => {
        if (score >= 80) return MOCK_AI_DATA.SCORE_BANDS.HOT;
        if (score >= 60) return MOCK_AI_DATA.SCORE_BANDS.WARM;
        if (score >= 40) return MOCK_AI_DATA.SCORE_BANDS.COOL;
        return MOCK_AI_DATA.SCORE_BANDS.COLD;
    };

    const getNBA = (leadId: string) => {
        // Use real NBA if available
        const intel = leadIntelligence[leadId];
        if (intel?.nba) return intel.nba;

        // Default fallback if no intelligence is generated yet
        return { label: "Review Application", type: "GENERAL" };
    };

    const getRisks = (leadId: string) => {
        const intel = leadIntelligence[leadId];
        if (intel?.risks) return intel.risks;
        return [];
    };

    const fetchLeadIntelligence = async (slug: string, leadId: string) => {
        try {
            const { getLeadIntelligenceAction } = await import('@/app/actions/admission-actions');
            const res = await getLeadIntelligenceAction(slug, leadId);
            if (res.success) {
                setLeadIntelligence(prev => ({
                    ...prev,
                    [leadId]: res.intelligence
                }));
            }
        } catch (error) {
            console.error(`Error fetching AI Intelligence for ${leadId}:`, error);
        }
    };

    return (
        <AIContext.Provider value={{
            getScoreBand,
            getNBA,
            getRisks,
            leadIntelligence,
            fetchLeadIntelligence
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (!context) throw new Error("useAI must be used within AIProvider");
    return context;
}
