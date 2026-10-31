import { LazyHeader } from "@/components/lazy-components";
import MomentsGallery from "@/components/moments/MomentsGallery";
import { BUILT_IN_MOMENTS, type CustomerMoment } from "@/lib/customerMoments";
import { buildStaticMetadata } from "@/lib/seo";
import { backendJsonSafe } from "@/lib/server/backend";

export const metadata = buildStaticMetadata("/traveller-stories");
export const revalidate = 60;

// All customer photos and videos (Admin → Customer Gallery), filterable by destination
export default async function TravellerStoriesPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const [{ place }, data] = await Promise.all([searchParams, backendJsonSafe<{ moments?: CustomerMoment[] }>("/api/customer-moments?limit=120")]);
  const moments = data?.moments?.length ? data.moments : BUILT_IN_MOMENTS;

  return (
    <>
      <LazyHeader />
      <MomentsGallery moments={moments} initialPlace={place || ""} />
    </>
  );
}
