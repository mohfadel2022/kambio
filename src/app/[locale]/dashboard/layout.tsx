import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden">
        <div className="flex flex-col h-screen overflow-hidden ">
          <Topbar user={session.user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 xl:px-20 xl:py-12">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
