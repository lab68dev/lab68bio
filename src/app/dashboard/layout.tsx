import { requireAuth } from "@/lib/auth-guard";
import DashboardShell from "./shell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Server-side auth guard — redirects to /login if no valid session
    const user = await requireAuth();

    return <DashboardShell user={user}>{children}</DashboardShell>;
}
