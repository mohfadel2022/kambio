import { getTranslations } from "next-intl/server";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  TrendingUp,
  BookOpen,
  User,
  PieChart,
  Settings
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function GuidePage() {
  const t = await getTranslations("Guide");

  const guideSections = [
    {
      id: "dashboard",
      title: t("dashboardTitle"),
      desc: t("dashboardDesc"),
      icon: LayoutDashboard,
      color: "hsl(217,91%,60%)",
      bg: "rgba(59,130,246,0.1)"
    },
    {
      id: "cajas",
      title: t("cajasTitle"),
      desc: t("cajasDesc"),
      icon: Wallet,
      color: "hsl(271,81%,56%)",
      bg: "rgba(168,85,247,0.1)"
    },
    {
      id: "orders",
      title: t("ordersTitle"),
      desc: t("ordersDesc"),
      icon: ArrowLeftRight,
      color: "hsl(142,71%,45%)",
      bg: "rgba(34,197,94,0.1)"
    },
    {
      id: "rates",
      title: t("ratesTitle"),
      desc: t("ratesDesc"),
      icon: TrendingUp,
      color: "hsl(38,92%,50%)",
      bg: "rgba(245,158,11,0.1)"
    },
    {
      id: "clients",
      title: t("clientsTitle"),
      desc: t("clientsDesc"),
      icon: User,
      color: "hsl(199,89%,48%)",
      bg: "rgba(14,165,233,0.1)"
    },
    {
      id: "reports",
      title: t("reportsTitle"),
      desc: t("reportsDesc"),
      icon: PieChart,
      color: "hsl(326,78%,55%)",
      bg: "rgba(236,72,153,0.1)"
    },
    {
      id: "settings",
      title: t("settingsTitle"),
      desc: t("settingsDesc"),
      icon: Settings,
      color: "hsl(215,16%,47%)",
      bg: "rgba(100,116,139,0.1)"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
        icon={BookOpen}
      />

      <div className="border-t" style={{ borderColor: "hsl(var(--border))" }} />

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideSections.map((section) => (
          <div 
            key={section.id}
            className="rounded-[2.5rem] p-8 card-shadow transition-transform hover:scale-[1.02] border"
            style={{ 
              background: "hsl(var(--card))", 
              borderColor: "hsl(var(--border))" 
            }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: section.bg, color: section.color }}
            >
              <section.icon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight mb-3">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              {section.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
