import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { calculateCompoundInterest } from "../../api/utilityApi";
import { PageHeader } from "../../components/PageHeader";
import type {
  CompoundInterestRequest,
  CompoundInterestResponse,
  CompoundingFrequency,
} from "../../types/calculators";

const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const frequencyOptions: Array<{
  label: string;
  value: CompoundingFrequency;
}> = [
  { label: "Annually", value: "ANNUALLY" },
  { label: "Biannually", value: "BIANNUALLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Daily", value: "DAILY" },
];

const periodsPerYearByFrequency: Record<CompoundingFrequency, number> = {
  ANNUALLY: 1,
  BIANNUALLY: 2,
  MONTHLY: 12,
  DAILY: 365,
};

function formatCompactValue(value: number) {
  return Number.isFinite(value) ? compactFormatter.format(value) : "—";
}

function formatAmount(value: number) {
  return Number.isFinite(value) ? amountFormatter.format(value) : "—";
}

export function CompoundInterestPage() {
  const [formValues, setFormValues] = useState({
    principal: "10000",
    annualRatePercentage: "8",
    years: "5",
    compoundingFrequency: "MONTHLY" as CompoundingFrequency,
    periodicContribution: "250",
  });
  const [result, setResult] = useState<CompoundInterestResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const principal = Number(formValues.principal || 0);
  const annualRatePercentage = Number(formValues.annualRatePercentage || 0);
  const years = Number(formValues.years || 0);
  const periodicContribution = Number(formValues.periodicContribution || 0);
  const periodsPerYear =
    periodsPerYearByFrequency[formValues.compoundingFrequency];
  const annualRateDecimal = annualRatePercentage / 100;
  const periodicRate = annualRateDecimal / periodsPerYear;
  const totalPeriods = Math.max(1, Math.round(years * periodsPerYear));
  const growthFactor = Math.pow(1 + periodicRate, totalPeriods);
  const principalFutureValue = principal * growthFactor;
  const contributionFutureValue =
    periodicContribution <= 0
      ? 0
      : Math.abs(periodicRate) < 0.0000000001
        ? periodicContribution * totalPeriods
        : periodicContribution * ((growthFactor - 1) / periodicRate);
  const calculatedMaturityAmount =
    principalFutureValue + contributionFutureValue;
  const calculatedTotalContributions =
    principal + periodicContribution * totalPeriods;
  const calculatedInterestEarned =
    calculatedMaturityAmount - calculatedTotalContributions;
  const hasPeriodicContribution = periodicContribution > 0;
  const principalGrowthFormula = "A = P(1 + r / n)^(n × t)";
  const contributionGrowthFormula =
    Math.abs(periodicRate) < 0.0000000001
      ? "FV(contributions) = PMT × (n × t)"
      : "FV(contributions) = PMT × (((1 + r / n)^(n × t) - 1) / (r / n))";
  const totalGrowthFormula = hasPeriodicContribution
    ? Math.abs(periodicRate) < 0.0000000001
      ? "Total amount = P + PMT × (n × t)"
      : "Total amount = P(1 + r / n)^(n × t) + PMT × (((1 + r / n)^(n × t) - 1) / (r / n))"
    : principalGrowthFormula;
  const parameterRows = [
    {
      symbol: "P",
      label: "Initial principal amount",
      value: amountFormatter.format(principal),
    },
    {
      symbol: "r",
      label: "Annual interest rate in decimal form",
      value: `${formatCompactValue(annualRateDecimal)} (${formatCompactValue(annualRatePercentage)}%)`,
    },
    {
      symbol: "n",
      label: "Compounding periods per year",
      value: `${periodsPerYear} (${formValues.compoundingFrequency.toLowerCase()})`,
    },
    {
      symbol: "t",
      label: "Time in years",
      value: formatCompactValue(years),
    },
    {
      symbol: "n × t",
      label: "Rounded total number of compounding periods used by the calculator",
      value: formatCompactValue(totalPeriods),
    },
    {
      symbol: "PMT",
      label: "Contribution added each compounding period",
      value: amountFormatter.format(periodicContribution),
    },
    {
      symbol: "r / n",
      label: "Interest rate applied per compounding period",
      value: formatCompactValue(periodicRate),
    },
  ];
  const principalGrowthSubstitution = `A = ${formatCompactValue(principal)} × (1 + ${formatCompactValue(annualRateDecimal)} / ${periodsPerYear})^(${periodsPerYear} × ${formatCompactValue(years)})`;
  const contributionGrowthSubstitution =
    Math.abs(periodicRate) < 0.0000000001
      ? `FV(contributions) = ${formatCompactValue(periodicContribution)} × (${periodsPerYear} × ${formatCompactValue(years)})`
      : `FV(contributions) = ${formatCompactValue(periodicContribution)} × (((1 + ${formatCompactValue(annualRateDecimal)} / ${periodsPerYear})^(${periodsPerYear} × ${formatCompactValue(years)}) - 1) / (${formatCompactValue(annualRateDecimal)} / ${periodsPerYear}))`;
  const principalGrowthBreakdown = `${formatAmount(principal)} × (1 + ${formatCompactValue(annualRateDecimal)} / ${periodsPerYear})^${totalPeriods} = ${formatAmount(principalFutureValue)}`;
  const contributionBreakdown =
    periodicContribution <= 0
      ? `No recurring contribution entered, so this part contributes ${formatAmount(0)}`
      : Math.abs(periodicRate) < 0.0000000001
        ? `${formatAmount(periodicContribution)} × ${totalPeriods} = ${formatAmount(contributionFutureValue)}`
        : `${formatAmount(periodicContribution)} × (((1 + ${formatCompactValue(annualRateDecimal)} / ${periodsPerYear})^${totalPeriods} - 1) / ${formatCompactValue(periodicRate)}) = ${formatAmount(contributionFutureValue)}`;
  const totalMaturityBreakdown = `${formatAmount(principalFutureValue)} + ${formatAmount(contributionFutureValue)} = ${formatAmount(calculatedMaturityAmount)}`;
  const totalContributionBreakdown = `${formatAmount(principal)} + (${formatAmount(periodicContribution)} × ${totalPeriods}) = ${formatAmount(calculatedTotalContributions)}`;
  const interestBreakdown = `${formatAmount(calculatedMaturityAmount)} - ${formatAmount(calculatedTotalContributions)} = ${formatAmount(calculatedInterestEarned)}`;
  const formulaLegendRows = [
    {
      symbol: "A",
      meaning: "Amount after compound growth from the principal portion",
    },
    {
      symbol: "P",
      meaning: "Initial principal or starting amount",
    },
    {
      symbol: "r",
      meaning: "Annual interest rate written in decimal form",
    },
    {
      symbol: "n",
      meaning: "Number of compounding periods in one year",
    },
    {
      symbol: "t",
      meaning: "Time in years",
    },
    {
      symbol: "PMT",
      meaning: "Recurring contribution added each compounding period",
    },
    {
      symbol: "FV",
      meaning: "Future value of the recurring contribution stream",
    },
  ];

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload: CompoundInterestRequest = {
      principal: Number(formValues.principal),
      annualRatePercentage: Number(formValues.annualRatePercentage),
      years: Number(formValues.years),
      compoundingFrequency: formValues.compoundingFrequency,
      periodicContribution: Number(formValues.periodicContribution || 0),
    };

    try {
      const response = await calculateCompoundInterest(payload);
      setResult(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to calculate compound interest right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFormValues({
      principal: "10000",
      annualRatePercentage: "8",
      years: "5",
      compoundingFrequency: "MONTHLY",
      periodicContribution: "250",
    });
    setResult(null);
    setErrorMessage("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Utility 1"
        title="Compound Interest Calculator"
        description="Estimate growth for savings or investments using annual, biannual, monthly, or daily compounding. Use the same currency across all amount fields for a clean result."
      />

      <section className="panel form-layout">
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>Investment Inputs</h2>
          <p className="helper-copy">
            Model lump-sum growth and optional recurring contributions in one
            place.
          </p>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="principal">Initial amount</label>
              <input
                id="principal"
                name="principal"
                type="number"
                min="0"
                step="0.01"
                value={formValues.principal}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="annualRatePercentage">Annual rate (%)</label>
              <input
                id="annualRatePercentage"
                name="annualRatePercentage"
                type="number"
                min="0"
                step="0.01"
                value={formValues.annualRatePercentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="years">Time period (years)</label>
              <input
                id="years"
                name="years"
                type="number"
                min="0"
                step="0.1"
                value={formValues.years}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="compoundingFrequency">Compounding frequency</label>
              <select
                id="compoundingFrequency"
                name="compoundingFrequency"
                value={formValues.compoundingFrequency}
                onChange={handleChange}
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field field--full">
              <label htmlFor="periodicContribution">
                Contribution per compounding period
              </label>
              <input
                id="periodicContribution"
                name="periodicContribution"
                type="number"
                min="0"
                step="0.01"
                value={formValues.periodicContribution}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Calculate growth"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </form>

        <aside className="result-panel">
          <h2>Projection</h2>
          <p className="helper-copy">
            Results assume contributions are added at the end of each compounding
            period.
          </p>

          {result ? (
            <>
              <div className="result-grid">
                <div className="metric-card">
                  <p className="metric-card__label">Maturity amount</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.maturityAmount)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Total contributions</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.totalContributions)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Interest earned</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.totalInterestEarned)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Effective annual rate</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.effectiveAnnualRatePercentage)}%
                  </p>
                  <p className="metric-card__meta">
                    {result.totalPeriods} total periods at{" "}
                    {result.compoundingFrequency.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="breakdown-panel">
                <p className="breakdown-panel__eyebrow">
                  How the final answer was calculated
                </p>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">1. Principal growth</p>
                  <p className="breakdown-step__value">
                    {principalGrowthBreakdown}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">2. Contribution growth</p>
                  <p className="breakdown-step__value">
                    {contributionBreakdown}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">
                    3. Final maturity amount
                  </p>
                  <p className="breakdown-step__value">
                    {totalMaturityBreakdown}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">4. Total contributions</p>
                  <p className="breakdown-step__value">
                    {totalContributionBreakdown}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">5. Interest earned</p>
                  <p className="breakdown-step__value">{interestBreakdown}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="metric-card">
              <p className="metric-card__label">No calculation yet</p>
              <p className="metric-card__meta">
                Enter values and run the projection to see maturity amount,
                contribution totals, and interest earned.
              </p>
            </div>
          )}
        </aside>
      </section>

      <section className="panel learning-panel">
        <div className="learning-section">
          <h2>Formula Used</h2>
          <p className="helper-copy">
            This calculator treats your initial amount and recurring
            contributions as two growth streams, then combines them into one
            maturity amount.
          </p>

          <div className="formula-legend">
            {formulaLegendRows.map((item) => (
              <div className="formula-legend__item" key={item.symbol}>
                <p className="formula-legend__symbol">{item.symbol}</p>
                <p className="formula-legend__meaning">{item.meaning}</p>
              </div>
            ))}
          </div>

          <div className="formula-stack">
            <div className="formula-card">
              <p className="formula-card__title">Principal growth</p>
              <p className="formula-block">{principalGrowthFormula}</p>
              <p className="formula-note">{principalGrowthSubstitution}</p>
            </div>

            <div className="formula-card">
              <p className="formula-card__title">Contribution growth</p>
              <p className="formula-block">{contributionGrowthFormula}</p>
              <p className="formula-note">
                {hasPeriodicContribution
                  ? contributionGrowthSubstitution
                  : "PMT is 0, so the contribution portion does not add anything to the final amount."}
              </p>
            </div>

            <div className="formula-card">
              <p className="formula-card__title">Combined maturity amount</p>
              <p className="formula-block">{totalGrowthFormula}</p>
              <p className="formula-note">
                Contributions are assumed to be added at the end of each
                compounding period, matching the backend calculation.
              </p>
            </div>
          </div>
        </div>

        <aside className="learning-section">
          <h2>Parameters Used</h2>
          <p className="helper-copy">
            These are the values currently being plugged into the formula.
          </p>

          <div className="parameter-list">
            {parameterRows.map((parameter) => (
              <div className="parameter-row" key={parameter.symbol}>
                <div>
                  <p className="parameter-row__symbol">{parameter.symbol}</p>
                  <p className="parameter-row__label">{parameter.label}</p>
                </div>
                <p className="parameter-row__value">{parameter.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
