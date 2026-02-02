import { redirect } from "next/navigation";

export default function ScopedSchoolLoginRedirect() {
    redirect("/school-login");
}
