"use client";

import { useTransition } from "react";
import { MoreVertical, Eye, Pencil, Trash2, UserCog, Loader2, Send, MessageCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export type ActionType = "view" | "edit" | "delete" | "permissions" | "send" | "whatsapp";

interface DataTableActionsProps {
  id: string;
  baseUrl: string;
  actions?: ActionType[];
  onDelete?: (id: string) => Promise<void>;
  onSend?: (id: string) => void;
  onWhatsapp?: (id: string) => void;
  labels?: {
    view?: string;
    edit?: string;
    delete?: string;
    permissions?: string;
    send?: string;
    whatsapp?: string;
  };
}

export function DataTableActions({
  id,
  baseUrl,
  actions = ["view", "edit", "delete"],
  onDelete,
  onSend,
  onWhatsapp,
  labels,
}: DataTableActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();
  const tCommon = useTranslations("Common");

  const performDelete = () => {
    if (onDelete) {
      startTransition(async () => {
        try {
          await onDelete(id);
          toast.success(tCommon("deleteSuccess"));
        } catch (error) {
          toast.error(tCommon("deleteError"));
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none disabled:opacity-50" disabled={isPending}>
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <MoreVertical className="w-4 h-4 opacity-50" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        {actions.includes("view") && (
          <DropdownMenuItem onClick={() => router.push(`${baseUrl}/${id}` as any)} className="flex items-center gap-2 cursor-pointer font-bold p-2 focus:**:!text-white">
            <Eye className="w-4 h-4 opacity-50" />
            <span>{labels?.view || tCommon("view")}</span>
          </DropdownMenuItem>
        )}
        {actions.includes("edit") && (
          <DropdownMenuItem onClick={() => router.push(`${baseUrl}/${id}/edit` as any)} className="flex items-center gap-2 cursor-pointer font-bold p-2 focus:**:!text-white">
            <Pencil className="w-4 h-4 opacity-50" />
            <span>{labels?.edit || tCommon("edit")}</span>
          </DropdownMenuItem>
        )}
        {actions.includes("permissions") && (
          <DropdownMenuItem onClick={() => router.push(`${baseUrl}/${id}/permissions` as any)} className="flex items-center gap-2 cursor-pointer font-bold p-2 focus:**:!text-white">
            <UserCog className="w-4 h-4 opacity-50 text-amber-600" />
            <span>{labels?.permissions || "Permissions"}</span>
          </DropdownMenuItem>
        )}
        {actions.includes("send") && (
          <DropdownMenuItem 
            onClick={() => onSend?.(id)} 
            className="flex items-center gap-2 cursor-pointer font-bold p-2 focus:**:!text-white text-emerald-600 dark:text-emerald-400"
          >
            <Send className="w-4 h-4 opacity-70" />
            <span>{labels?.send || "Enviar"}</span>
          </DropdownMenuItem>
        )}
        {actions.includes("whatsapp") && (
          <DropdownMenuItem 
            onClick={() => onWhatsapp?.(id)} 
            className="flex items-center gap-2 cursor-pointer font-bold p-2 focus:**:!text-white text-emerald-500"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-70">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{labels?.whatsapp || "WhatsApp"}</span>
          </DropdownMenuItem>
        )}
        
        {actions.includes("delete") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsConfirmOpen(true)}
              disabled={isPending}
              className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 cursor-pointer font-bold p-2 focus:**:!text-white"
            >
              <Trash2 className="w-4 h-4 opacity-50" />
              <span>{labels?.delete || tCommon("delete")}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={tCommon("confirmDeleteTitle")}
        description={tCommon("confirmDeleteDesc")}
        onConfirm={performDelete}
        confirmText={tCommon("delete")}
        cancelText={tCommon("cancel")}
        variant="destructive"
      />
    </DropdownMenu>
  );
}
