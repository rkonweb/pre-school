import * as React from "react"
import { cn } from "@/lib/utils"

const C = {
    navy: "#1E1B4B", navyM: "#312E81",
    g50: "#F9FAFB", g100: "#F3F4F6", g700: "#374151",
    amber: "#F59E0B", amberXL: "#FFFBEB",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
};

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, style, ...props }, ref) => (
        <div style={{ borderRadius: 20, border: `1px solid ${C.g100}`, overflow: "hidden", boxShadow: C.sh }}>
            <table ref={ref} className={cn("w-full caption-bottom", className)} style={{ borderCollapse: "collapse", ...style }} {...props} />
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, style, ...props }, ref) => (
        <thead ref={ref} className={cn(className)} style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, ...style }} {...props} />
    )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, style, ...props }, ref) => (
        <tbody ref={ref} className={cn(className)} style={style} {...props} />
    )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, style, ...props }, ref) => (
        <tfoot ref={ref} className={cn("font-medium", className)} style={{ background: C.g50, borderTop: `1px solid ${C.g100}`, ...style }} {...props} />
    )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className, style, onMouseEnter, onMouseLeave, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn("transition-all", className)}
            style={{ borderBottom: `1px solid ${C.g100}`, transition: C.tr, ...style }}
            onMouseEnter={e => {
                (e.currentTarget).style.background = C.amberXL;
                (e.currentTarget).style.transform = "translateX(2px)";
                onMouseEnter?.(e);
            }}
            onMouseLeave={e => {
                (e.currentTarget).style.background = "";
                (e.currentTarget).style.transform = "none";
                onMouseLeave?.(e);
            }}
            {...props}
        />
    )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, style, ...props }, ref) => (
        <th
            ref={ref}
            className={cn("text-left align-middle font-bold", className)}
            style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none", ...style }}
            {...props}
        />
    )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, style, ...props }, ref) => (
        <td
            ref={ref}
            className={cn("align-middle", className)}
            style={{ padding: "11px 14px", fontSize: 13.5, color: C.g700, ...style }}
            {...props}
        />
    )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, style, ...props }, ref) => (
        <caption ref={ref} className={cn("mt-4 text-sm", className)} style={{ color: "#9CA3AF", ...style }} {...props} />
    )
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
