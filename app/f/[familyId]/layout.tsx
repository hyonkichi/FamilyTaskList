import BottomNav from "@/components/BottomNav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ familyId: string }>;
}

export default async function FamilyLayout({ children, params }: Props) {
  const { familyId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">{children}</div>
      <BottomNav familyId={familyId} />
    </div>
  );
}
