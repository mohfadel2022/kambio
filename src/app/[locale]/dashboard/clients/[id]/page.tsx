import { notFound } from "next/navigation";
import { Users, ArrowLeft, User } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getClientDetailsPageData } from "@/app/actions/clients";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientDetailsPageData(id);

  if (!client) notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-black tracking-tight">Detalles del Cliente</h1>
        </div>
      </div>

      <div className="card-rounded p-8 bg-card border border-slate-200 dark:border-slate-800 card-shadow flex items-center gap-6">
        <div className="w-16 h-16 card-rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <User className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight">{client.firstName} {client.lastName}</h2>
          <p className="text-sm text-muted-foreground font-medium">{client.email || "Sin email"} • {client.phone || "Sin teléfono"}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="card-rounded p-6 bg-card border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black mb-4">Información General</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground font-medium">Documento</dt>
              <dd className="font-bold">{client.documentId || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground font-medium">Registrado el</dt>
              <dd className="font-bold">{new Date(client.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
