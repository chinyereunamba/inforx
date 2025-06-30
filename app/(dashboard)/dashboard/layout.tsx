@@ .. @@
 import ModernDashboardLayout from "@/components/dashboard/ModernDashboardLayout";
+import { Toaster } from "sonner";
 
 type DashboardProps = {
@@ .. @@
     </div>
   );
 
-  return <EnhancedDashboardLayout>{children}</EnhancedDashboardLayout>;
+  return (
+    <>
+      <Toaster position="top-right" richColors />
+      <EnhancedDashboardLayout>{children}</EnhancedDashboardLayout>
+    </>
+  );
 }