import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="Missing Route"
        title="That utility page does not exist yet."
        description="The superapp starter is ready for more modules, but this route has not been wired in yet."
      />
      <Link className="page-link" to="/">
        Return to utilities →
      </Link>
    </>
  );
}
