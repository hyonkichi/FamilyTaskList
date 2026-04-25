import BottomNav from "@/components/BottomNav";
import { FamilyProvider } from "@/lib/FamilyContext";
import NotificationChecker from "@/components/NotificationChecker";

interface Props {
  children: React.ReactNode;
  params: Promise<{ familyId: string }>;
}

export default async function FamilyLayout({ children, params }: Props) {
  const { familyId } = await params;

  return (
    <FamilyProvider familyId={familyId}>
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <NotificationChecker familyId={familyId} />
        <div className="pb-20">{children}</div>
        <BottomNav familyId={familyId} />
      </div>
    </FamilyProvider>
  );
}
