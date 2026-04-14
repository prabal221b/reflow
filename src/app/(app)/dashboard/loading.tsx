import { CalmCardLoading } from "@/components/shared/calm-loading";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="mx-auto h-14 w-14 calm-skeleton rounded-2xl mb-3" />
        <div className="mx-auto h-6 w-48 calm-skeleton rounded-lg mb-2" />
        <div className="mx-auto h-4 w-64 calm-skeleton rounded-lg" />
      </div>
      <CalmCardLoading />
      <CalmCardLoading />
      <div className="grid grid-cols-3 gap-3">
        <CalmCardLoading />
        <CalmCardLoading />
        <CalmCardLoading />
      </div>
    </div>
  );
}
