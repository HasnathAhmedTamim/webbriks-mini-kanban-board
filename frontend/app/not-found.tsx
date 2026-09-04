import { StatusPage } from "@/components/ui/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="This page doesn’t exist or the link is outdated."
      primaryHref="/boards"
      primaryLabel="Go to boards"
      secondaryHref="/"
      secondaryLabel="Home"
    />
  );
}
