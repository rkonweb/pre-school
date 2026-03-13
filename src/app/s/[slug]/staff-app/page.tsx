import { StaffAppLayout } from "@/components/mobile/staff/StaffAppLayout";
import { TeacherDashboard } from "@/components/mobile/staff/TeacherDashboard";
import { StaffBottomNav } from "@/components/mobile/staff/StaffBottomNav";

export default function StaffAppPage() {
  return (
    <StaffAppLayout>
      <TeacherDashboard />
      <StaffBottomNav />
    </StaffAppLayout>
  );
}
