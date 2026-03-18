"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
    Plus, Palmtree, Users, Edit3, 
    Trash2, Search, Shield 
} from "lucide-react";
import { 
    SectionHeader, Btn, 
    StatusChip 
} from "@/components/ui/erp-ui";
import { 
    getClubsAction, 
    createClubAction, 
    updateClubAction, 
    deleteClubAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import ClubModal from "@/components/extracurricular/ClubModal";

export default function ClubsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm } = useConfirm();
    
    const [clubs, setClubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState<any>(null);

    const loadData = async () => {
        setIsLoading(true);
        const res = await getClubsAction(slug);
        if (res.success) {
            setClubs(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const handleAdd = () => {
        setSelectedClub(null);
        setIsModalOpen(true);
    };

    const handleEdit = (club: any) => {
        setSelectedClub(club);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Delete Club",
            message: "Are you sure you want to delete this club? This action cannot be undone.",
            confirmText: "Delete",
            variant: "danger"
        });

        if (isConfirmed) {
            const res = await deleteClubAction(slug, id);
            if (res.success) {
                toast.success("Club deleted successfully");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete club");
            }
        }
    };

    const handleModalSubmit = async (data: any) => {
        let res;
        if (selectedClub) {
            res = await updateClubAction(slug, selectedClub.id, data);
        } else {
            res = await createClubAction(slug, data);
        }

        if (res.success) {
            toast.success(selectedClub ? "Club updated successfully" : "Club created successfully");
            loadData();
        } else {
            throw new Error(res.error || "Operation failed");
        }
    };

    const filtered = clubs.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-8 p-8 min-w-0">
            <SectionHeader
                title="Clubs & Academies"
                subtitle="Manage specialized student organizations and interest-based clubs."
                icon={Palmtree}
                action={
                    <Link href={`/s/${slug}/extracurricular/clubs/create`}>
                        <Btn icon={Plus}>Create Club</Btn>
                    </Link>
                }
            />

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border-2 border-zinc-100 shadow-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search clubs by name..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((club) => (
                    <div 
                        key={club.id}
                        className="group relative p-8 bg-white rounded-[40px] border-2 border-zinc-100 shadow-sm hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all overflow-hidden"
                    >
                        {/* Decorative Background Icon */}
                        <Shield className="absolute -right-8 -bottom-8 w-32 h-32 text-zinc-50 group-hover:text-emerald-50 group-hover:-rotate-12 transition-all duration-500" />
                        
                        <div className="relative flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {club.logo ? (
                                        <img src={club.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Shield className="w-8 h-8" />
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <StatusChip label="Active" color="emerald" />
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-2">EST. {new Date(club.createdAt).getFullYear()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{club.name}</h3>
                                <p className="text-sm font-bold text-zinc-400 line-clamp-2 leading-relaxed h-10 italic">
                                    {club.description || "Building talent and fostering community through shared interests and expertise."}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                                        {club.coach?.avatar ? (
                                            <img src={club.coach.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Users className="w-4 h-4 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">President / Mentor</span>
                                        <span className="text-sm font-black text-zinc-700">
                                            {club.coach ? `${club.coach.firstName} ${club.coach.lastName}` : "Not Assigned"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Capacity</span>
                                    <span className="text-[15px] font-black text-zinc-900">{club.capacity || "∞"} <span className="text-[11px] text-zinc-300">LIMIT</span></span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Schedule</span>
                                    <span className="text-sm font-black text-zinc-600">{club.meetingSchedule || "Flexible"}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-zinc-200 hover:shadow-emerald-100"
                                    onClick={() => toast.info("Membership management coming soon!")}
                                >
                                    View Members
                                </button>
                                <button 
                                    className="p-3 bg-zinc-100 text-zinc-400 rounded-2xl hover:bg-zinc-200 hover:text-zinc-600 transition-all"
                                    onClick={() => handleEdit(club)}
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                    className="p-3 bg-zinc-100 text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                                    onClick={() => handleDelete(club.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center gap-6 bg-zinc-50/50 rounded-[60px] border-4 border-dashed border-zinc-100">
                    <Palmtree className="w-20 h-20 text-zinc-100" />
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-zinc-300 uppercase tracking-tighter">No Clubs Found</h2>
                        <p className="text-zinc-400 font-bold max-w-xs mx-auto mt-2 italic">Be the pioneer and start the first specialized club in your school community.</p>
                    </div>
                    <Link href={`/s/${slug}/extracurricular/clubs/create`}>
                        <Btn variant="primary" icon={Plus}>Add New Club</Btn>
                    </Link>
                </div>
            )}

            <ClubModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedClub}
                slug={slug}
            />
        </div>
    );
}
