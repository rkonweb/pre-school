import * as React from "react"
import { Input, InputProps } from "./input"

export const PhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ onChange, value, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) {
                // Manually trigger onChange if it exists
                if (onChange) {
                    const event = {
                        ...e,
                        target: {
                            ...e.target,
                            value: val,
                        },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                }
            }
        };

        return (
            <Input
                {...props}
                type="tel"
                ref={ref}
                value={value}
                onChange={handleChange}
                maxLength={10}
            />
        )
    }
)
PhoneInput.displayName = "PhoneInput"
