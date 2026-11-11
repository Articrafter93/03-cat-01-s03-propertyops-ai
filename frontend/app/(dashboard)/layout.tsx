import { Sidebar } from "@/components/layout/Sidebar";
import { requireSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const locale = await getLocale();

  return (
    <I18nProvider locale={locale}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar userEmail={session.email} role={session.role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </I18nProvider>
  );
}
