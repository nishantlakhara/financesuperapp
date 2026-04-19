import { Link } from "react-router-dom";
import type { UtilitySummary } from "../types/utility";

type UtilityCardProps = {
  utility: UtilitySummary;
};

export function UtilityCard({ utility }: UtilityCardProps) {
  return (
    <Link className="utility-card" to={utility.route}>
      <div>
        <div className="utility-card__initial">
          {utility.title.charAt(0).toUpperCase()}
        </div>
        <h2 className="utility-card__title">{utility.title}</h2>
        <p className="utility-card__description">{utility.description}</p>
      </div>

      <div className="utility-card__footer">
        <span className="utility-card__tag">{utility.slug}</span>
        <span>Open →</span>
      </div>
    </Link>
  );
}
