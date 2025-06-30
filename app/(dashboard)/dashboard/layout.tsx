import EnhancedDashboardLayout from "@/components/dashboard/EnhancedDashboardLayout";
import { Toaster } from "sonner";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedDashboardLayout>
      <Toaster />
      {children}
    </EnhancedDashboardLayout>
  );
}