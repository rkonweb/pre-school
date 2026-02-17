import { PricingClient } from "@/components/pricing/PricingClient";
import { getAvailablePlansAction } from "@/app/actions/subscription-actions";
import { Footer } from "@/components/figma/Footer";

export default async function PricingPage() {
    const result = await getAvailablePlansAction();
    const plans = result.success && result.data ? result.data : [];

    return (
        <>
            <PricingClient plans={plans} />
        </>
    );
}
