import { useState } from "react";
import { defaultUtilities } from "../api/utilityApi";
import { PageHeader } from "../components/PageHeader";
import { UtilityCard } from "../components/UtilityCard";
import type { UtilitySummary } from "../types/utility";

export function HomePage() {
  const [utilities] = useState<UtilitySummary[]>(defaultUtilities);
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const visibleUtilities = utilities
    .filter((utility) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      const haystack = [
        utility.title,
        utility.description,
        utility.slug,
        ...utility.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearchTerm);
    })
    .sort((left, right) => left.title.localeCompare(right.title));

  return (
    <>
      <PageHeader
        eyebrow="Finance Utilities"
        title="A scalable starter for your day-to-day finance superapp."
        description="Browse utilities alphabetically, search instantly, and grow the platform one feature at a time. This starter is structured to support more modules, stronger auth, and increasing traffic without turning into a tangle."
      />

      <section className="panel search-panel">
        <div className="search-panel__row">
          <input
            className="search-panel__input"
            type="search"
            placeholder="Search utilities by name, use case, or keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search utilities"
          />
          <div className="search-panel__count">
            {visibleUtilities.length}{" "}
            {visibleUtilities.length === 1 ? "utility" : "utilities"} available
          </div>
        </div>


      </section>

      {visibleUtilities.length > 0 ? (
        <section className="utility-grid">
          {visibleUtilities.map((utility) => (
            <UtilityCard key={utility.slug} utility={utility} />
          ))}
        </section>
      ) : (
        <section className="panel empty-state">
          No utilities matched that search. Try terms like{" "}
          <strong>interest</strong>, <strong>loan</strong>, or{" "}
          <strong>scientific</strong>.
        </section>
      )}
    </>
  );
}
