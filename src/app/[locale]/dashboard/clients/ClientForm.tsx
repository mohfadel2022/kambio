"use client";

import { useActionState } from "react";
import { createClient, updateClient, type ClientState } from "@/app/actions/clients";
import { ArrowRight, Loader2, User, Phone, Mail, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

type Client = {
  id?: string;
  firstName: string;
  lastName: string;
  documentId?: string | null;
  phone?: string | null;
  email?: string | null;
};

const initialState: ClientState = {};

function Field({ label, name, error, children }: { label: string; name: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-[10px] font-black uppercase tracking-[0.2em] px-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-bold px-2 animate-shake" style={{ color: "hsl(var(--destructive))" }}>
          {error.join(", ")}
        </p>
      )}
    </div>
  );
}

const inputClass = "w-full px-6 py-4 card-rounded text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 placeholder:opacity-30";

export default function ClientForm({ initialData }: { initialData?: Client }) {
  const isEditing = !!initialData?.id;
  const t = useTranslations("Clients");
  const common = useTranslations("Common");

  const actionFunction = isEditing
    ? updateClient.bind(null, initialData.id!)
    : createClient;

  const [state, action, pending] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="max-w-2xl mx-auto pb-20 w-full">
      <div className="card-rounded p-6 md:p-10 space-y-8 card-shadow" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        
        {state.message && (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-6 py-4 card-rounded animate-shake card-shadow" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", color: "hsl(var(--destructive))" }}>
            {state.message}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <User className="w-4 h-4 opacity-30" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t("title") || "Client Details"}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label={t("firstName")} name="firstName" error={state.errors?.firstName}>
              <input id="firstName" name="firstName" type="text" defaultValue={initialData?.firstName || ""} className={inputClass} required />
            </Field>
            <Field label={t("lastName")} name="lastName" error={state.errors?.lastName}>
              <input id="lastName" name="lastName" type="text" defaultValue={initialData?.lastName || ""} className={inputClass} required />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <Field label={t("phone")} name="phone" error={state.errors?.phone}>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Phone className="w-4 h-4" /></span>
                 <input id="phone" name="phone" type="tel" placeholder="+34 600 000 000" defaultValue={initialData?.phone || ""} className={`${inputClass} pl-10`} />
               </div>
            </Field>
            <Field label={t("email")} name="email" error={state.errors?.email}>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><Mail className="w-4 h-4" /></span>
                 <input id="email" name="email" type="email" defaultValue={initialData?.email || ""} className={`${inputClass} pl-10`} />
               </div>
            </Field>
          </div>

          <Field label={t("documentId")} name="documentId" error={state.errors?.documentId}>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"><FileText className="w-4 h-4" /></span>
               <input id="documentId" name="documentId" type="text" defaultValue={initialData?.documentId || ""} className={`${inputClass} pl-10`} />
             </div>
          </Field>
        </div>

        <div className="border-t pt-8 mt-4" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 w-full flex items-center justify-center gap-3 py-5 card-rounded text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-emerald-500/20"
              style={{ background: "linear-gradient(135deg, hsl(142, 76%, 24%), hsl(142, 70%, 35%))" }}
            >
              {pending ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{isEditing ? t("updating") : t("creating")}</>
              ) : (
                <><span>{isEditing ? t("updateButton") : t("createButton")}</span><ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            <Link
              href="/dashboard/clients"
              className="w-full sm:w-auto text-center px-10 py-5 card-rounded text-sm font-black transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
            >
              {common("cancel")}
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
