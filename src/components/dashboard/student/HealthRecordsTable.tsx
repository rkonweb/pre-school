"use client";

import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Download,
    Eye,
    ArrowUpDown,
    Filter,
    X,
    ArrowUp,
    ArrowDown,
    AlertCircle
} from "lucide-react";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import Link from "next/link";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";

interface StudentHealthData {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string | null;
    className: string;
    sectionName: string;
    gender: string | null;
    hasRecord: boolean;
    lastCheckup: Date | null;
    height: number | null;
    weight: number | null;
    bmi: number | null;
    bmiStatus: string;
    bloodGroup: string | null;
    allergies: string | null;
    chronicConditions: string | null;
    vision: string | null;
    dental: string | null;
}

interface Props {
    data: StudentHealthData[];
    slug: string;
}

type SortConfig = {
    key: keyof StudentHealthData | "fullName";
    direction: "asc" | "desc";
};

export function HealthRecordsTable({ data, slug }: Props) {
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [bmiFilter, setBmiFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [alertFilter, setAlertFilter] = useState("all");
    const [bloodGroupFilter, setBloodGroupFilter] = useState("all");

    // Sorting
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "firstName", direction: "asc" });

    // Extract unique classes for filter
    const classes = useMemo(() => {
        const unique = new Set(data.map(d => d.className));
        return Array.from(unique).filter(Boolean).sort();
    }, [data]);

    // Filter Logic
    const filteredData = useMemo(() => {
        return data.filter(student => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.admissionNumber && student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesClass = classFilter === "all" || student.className === classFilter;

            const matchesGender = genderFilter === "all" || student.gender === genderFilter;

            const matchesBloodGroup = bloodGroupFilter === "all" || student.bloodGroup === bloodGroupFilter;

            const matchesBmi = bmiFilter === "all" ||
                (bmiFilter === "underweight" && student.bmiStatus === "Underweight") ||
                (bmiFilter === "healthy" && student.bmiStatus === "Healthy Weight") ||
                (bmiFilter === "overweight" && student.bmiStatus === "Overweight") ||
                (bmiFilter === "obese" && student.bmiStatus === "Obesity") ||
                (bmiFilter === "unknown" && student.bmiStatus === "Unknown");

            const matchesAlert = alertFilter === "all" ||
                (alertFilter === "allergy" && !!student.allergies) ||
                (alertFilter === "medical" && !!student.chronicConditions) ||
                (alertFilter === "issues" && (!!student.allergies || !!student.chronicConditions || student.bmiStatus === "Underweight" || student.bmiStatus === "Obesity"));

            return matchesSearch && matchesClass && matchesBmi && matchesGender && matchesAlert && matchesBloodGroup;
        });
    }, [data, searchTerm, classFilter, bmiFilter, genderFilter, alertFilter, bloodGroupFilter]);

    // Sort Logic
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof StudentHealthData];
            let bValue: any = b[sortConfig.key as keyof StudentHealthData];

            if (sortConfig.key === "fullName") {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            }

            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key: keyof StudentHealthData | "fullName") => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc"
        }));
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 text-zinc-300" />;
        return sortConfig.direction === "asc" ?
            <ArrowUp className="h-3 w-3 text-brand" /> :
            <ArrowDown className="h-3 w-3 text-brand" />;
    };

    const clearFilters = () => {
        setSearchTerm("");
        setClassFilter("all");
        setBmiFilter("all");
        setGenderFilter("all");
        setAlertFilter("all");
        setBloodGroupFilter("all");
    };

    const hasActiveFilters = searchTerm || classFilter !== "all" || bmiFilter !== "all" || genderFilter !== "all" || alertFilter !== "all" || bloodGroupFilter !== "all";

    const getBmiBadgeColor = (status: string) => {
        switch (status) {
            case "Underweight": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Healthy Weight": return "bg-green-100 text-green-700 border-green-200";
            case "Overweight": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Obesity": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-zinc-100 text-zinc-500 border-zinc-200";
        }
    };

    const handleExport = () => {
        const headers = ["Admission No", "Name", "Class", "Gender", "Height", "Weight", "BMI", "Status", "Blood Group", "Allergies", "Conditions", "Last Checkup"];
        const csvContent = [
            headers.join(","),
            ...sortedData.map(d => [
                d.admissionNumber || "",
                `"${d.firstName} ${d.lastName}"`,
                d.className,
                d.gender || "",
                d.height || "",
                d.weight || "",
                d.bmi ? d.bmi.toFixed(1) : "",
                d.bmiStatus,
                d.bloodGroup || "",
                `"${d.allergies || ""}"`,
                `"${d.chronicConditions || ""}"`,
                d.lastCheckup ? format(new Date(d.lastCheckup), "yyyy-MM-dd") : "Never"
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `health_records_${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 w-full relative">
                        <Search className="h-4 w-4 text-zinc-400 absolute left-3" />
                        <Input
                            placeholder="Search by name, admission no, or roll no..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 w-full md:max-w-sm"
                            aria-label="Search Health Records"
                            title="Search Health Records"
                        />
                    </div>

                    <div className="flex gap-2">
                        {hasActiveFilters && (
                            <StandardActionButton
                                variant="ghost"
                                icon={X}
                                label="Clear"
                                onClick={clearFilters}
                                className="text-zinc-500 h-9"
                            />
                        )}
                        <StandardActionButton
                            variant="outline"
                            icon={Download}
                            label="Export"
                            onClick={handleExport}
                            className="gap-2 h-9"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="h-3.5 w-3.5 text-zinc-400 mr-2" />

                    <Select value={classFilter} onValueChange={setClassFilter} className="w-auto">
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={genderFilter} onValueChange={setGenderFilter} className="w-auto">
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={bmiFilter} onValueChange={setBmiFilter} className="w-auto">
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="BMI Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All BMI Status</SelectItem>
                            <SelectItem value="underweight">Underweight</SelectItem>
                            <SelectItem value="healthy">Healthy Weight</SelectItem>
                            <SelectItem value="overweight">Overweight</SelectItem>
                            <SelectItem value="obese">Obese</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter} className="w-auto">
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Blood Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Blood Groups</SelectItem>
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={alertFilter} onValueChange={setAlertFilter} className="w-auto">
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Health Alerts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">No Alerts Filter</SelectItem>
                            <SelectItem value="allergy">Has Allergies</SelectItem>
                            <SelectItem value="medical">Medical Conditions</SelectItem>
                            <SelectItem value="issues">All Health Issues</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50/50">
                            <TableRow>
                                <TableHead className="w-[100px] cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("admissionNumber")}>
                                    <div className="flex items-center gap-1">Adm No {getSortIcon("admissionNumber")}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("fullName")}>
                                    <div className="flex items-center gap-1">Student Name {getSortIcon("fullName")}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("className")}>
                                    <div className="flex items-center gap-1">Class {getSortIcon("className")}</div>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("lastCheckup")}>
                                    <div className="flex items-center justify-end gap-1">Last Checkup {getSortIcon("lastCheckup")}</div>
                                </TableHead>
                                <TableHead className="text-right">Height/Weight</TableHead>
                                <TableHead className="text-center cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleSort("bmi")}>
                                    <div className="flex items-center justify-center gap-1">BMI {getSortIcon("bmi")}</div>
                                </TableHead>
                                <TableHead>Blood Group</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <div className="p-4 bg-zinc-100 rounded-full mb-3">
                                                <Filter className="h-8 w-8 text-zinc-400" />
                                            </div>
                                            <p className="font-medium">No records found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms</p>
                                            {hasActiveFilters && (
                                                <Button variant="link" onClick={clearFilters} className="mt-2 text-brand">
                                                    Clear all filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedData.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-zinc-50/50">
                                        <TableCell className="font-medium text-xs text-muted-foreground">
                                            {student.admissionNumber || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <StudentAvatar
                                                    src={null} // Current data doesn't have avatar, will use fallback
                                                    name={`${student.firstName} ${student.lastName}`}
                                                    className="h-10 w-10 rounded-xl"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900">{cleanName(`${student.firstName} ${student.lastName}`)}</span>
                                                    <span className="text-xs text-muted-foreground">{student.gender || "-"}</span>
                                                    {(student.allergies || student.chronicConditions) && (
                                                        <div className="flex gap-1 mt-1">
                                                            {student.allergies && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 gap-1"><AlertCircle className="h-2 w-2" /> Allergy</Badge>}
                                                            {student.chronicConditions && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Medical</Badge>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal text-zinc-600 bg-zinc-50">
                                                {student.className}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {student.lastCheckup ? (
                                                <span className="text-zinc-700 font-medium">
                                                    {format(new Date(student.lastCheckup), "MMM d, yyyy")}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400 text-xs italic">Never</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {student.height || student.weight ? (
                                                <div className="flex flex-col items-end gap-0.5">
                                                    {student.height && <span className="text-xs font-medium">{student.height} cm</span>}
                                                    {student.weight && <span className="text-xs text-muted-foreground">{student.weight} kg</span>}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {student.bmi ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-bold text-zinc-700">{student.bmi.toFixed(1)}</span>
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${getBmiBadgeColor(student.bmiStatus)}`}>
                                                        {student.bmiStatus}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {student.bloodGroup ? (
                                                <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100">
                                                    {student.bloodGroup}
                                                </Badge>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <StandardActionButton
                                                asChild
                                                variant="ghost"
                                                icon={Eye}
                                                iconOnly
                                                className="h-8 w-8 hover:bg-brand/10 hover:text-brand"
                                                tooltip="View Record"
                                                permission={{ module: 'students.profiles', action: 'view' }}
                                            >
                                                <Link href={`/s/${slug}/students/${student.id}?tab=health`} />
                                            </StandardActionButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-zinc-50 border-t p-3 text-xs text-muted-foreground flex justify-between items-center">
                    <span>Showing {sortedData.length} students</span>
                    {sortedData.length !== data.length && (
                        <span>(Filtered from {data.length} total)</span>
                    )}
                </div>
            </div>
        </div>
    );
}
