import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
export default function ReportsPage() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Reports"
        subtitle="Coming soon — export and analytics."
        icon={BarChart3}
      />
    </div>
  );
}
