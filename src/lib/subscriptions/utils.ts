/**
 * Calculate cost for additional users based on tiered pricing
 */
export function calculateTieredAddonCost(
    currentCount: number,
    newCount: number,
    tiers: { from: number; to: number | null; pricePerUser: number }[]
): number {
    let totalCost = 0;

    // If no tiers are provided, use a default rate (e.g., 50 per user)
    if (!tiers || tiers.length === 0) {
        return newCount * 50;
    }

    const sortedTiers = [...tiers].sort((a, b) => a.from - b.from);

    // Calculate cost for each user from (currentCount + 1) to (currentCount + newCount)
    for (let i = currentCount + 1; i <= currentCount + newCount; i++) {
        // Find the tier for this specific user number
        const tier = sortedTiers.find(t => i >= t.from && (t.to === null || i <= t.to));
        if (tier) {
            totalCost += tier.pricePerUser;
        } else {
            // Default to the last tier's price if out of range
            const lastTier = sortedTiers[sortedTiers.length - 1];
            totalCost += lastTier ? lastTier.pricePerUser : 50;
        }
    }

    return totalCost;
}
