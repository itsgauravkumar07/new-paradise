import { permanentRedirect } from "next/navigation";

const ItineraryRedirectPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const resolvedParams = await params;
  permanentRedirect(`/package/${resolvedParams.slug}`);
};

export default ItineraryRedirectPage;
