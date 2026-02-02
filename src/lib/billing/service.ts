import { FeeHead } from "./types";
import {
    differenceInMonths,
    endOfMonth,
    isAfter,
    startOfMonth,
    addMonths,
    differenceInCalendarMonths
} from "date-fns";

export function calculateProRataFee(
    joiningDate: Date,
    academicYearEnd: Date,
    feeHead: FeeHead
): number {
    if (feeHead.frequency === "ONCE" || feeHead.frequency === "ANNUAL") {
        // For annual or once fees, we might want to charge fully or pro-rate by remaining months
        // Let's assume for this preschool, Annual fees are pro-rated by months remaining
        const totalMonths = 12;
        const monthsUsed = differenceInCalendarMonths(academicYearEnd, joiningDate) + 1;
        const remainingMonths = Math.max(0, Math.min(totalMonths, monthsUsed));

        return (feeHead.amount / totalMonths) * remainingMonths;
    }

    if (feeHead.frequency === "MONTHLY") {
        return feeHead.amount; // Monthly is usually flat unless we go down to days
    }

    if (feeHead.frequency === "QUARTERLY") {
        // Similarly for quarterly
        return feeHead.amount;
    }

    return feeHead.amount;
}

export function getRemainingAcademicMonths(joiningDate: Date, academicYearEnd: Date): number {
    const months = differenceInCalendarMonths(academicYearEnd, joiningDate) + 1;
    return Math.max(0, months);
}
