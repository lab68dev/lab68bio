import { redirect } from "next/navigation";
import { getSession } from "./auth";

/**
 * Server-side auth guard — replaces the deprecated middleware.ts approach.
 * Call this at the top of any Server Component or layout that must be protected.
 *
 * Returns the authenticated user or redirects to /login.
 */
export async function requireAuth() {
    const user = await getSession();
    if (!user) redirect("/login");
    return user;
}

/**
 * Redirect authenticated users away from auth pages (login / register).
 * Call at the top of login/register layouts or pages.
 */
export async function redirectIfAuthenticated() {
    const user = await getSession();
    if (user) redirect("/dashboard");
}

/**
 * API route auth guard.
 * Returns the authenticated user or null.
 */
export async function requireApiAuth() {
    const user = await getSession();
    return user;
}
