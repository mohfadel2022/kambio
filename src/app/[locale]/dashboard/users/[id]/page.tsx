import { notFound } from "next/navigation";
import { Users,  ArrowLeft, UserCog } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserForEdit } from "@/app/actions/users";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await getUserForEdit(id);

  if (!user) notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Detalles del Usuario"
          icon={Users}
        />
      </div>

      <div className="card-rounded p-8 bg-card border border-slate-200 dark:border-slate-800 card-shadow flex items-center gap-6">
        <div className="w-16 h-16 card-rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <UserCog className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">{user.name}</h2>
          <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
          <Badge variant="outline" className="mt-2 uppercase text-[10px] font-black tracking-widest">{user.role?.name}</Badge>
        </div>
      </div>
    </div>
  );
}
