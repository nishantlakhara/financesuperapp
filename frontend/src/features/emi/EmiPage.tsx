import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { calculateEmi } from "../../api/utilityApi";
import { PageHeader } from "../../components/PageHeader";
import type { EmiRequest, EmiResponse } from "../../types/calculators";

const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

function formatAmount(value: number) {
  return Number.isFinite(value) ? amountFormatter.format(value) : "—";
}

function formatCompactValue(value: number) {
  return Number.isFinite(value) ? compactFormatter.format(value) : "—";
}

function formatCsvNumber(value: number, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "";
}

function csvEscape(value: string | number) {
  const normalizedValue = String(value);
  return /[",\n]/.test(normalizedValue)
    ? `"${normalizedValue.replace(/"/g, '""')}"`
    : normalizedValue;
}

type AmortizationRow = {
  month: number;
  installment: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
};

type HoveredPayoffPoint = {
  month: number;
  balance: number;
  x: number;
  y: number;
};

type HoveredSplitPoint = {
  month: number;
  installment: number;
  principalPaid: number;
  interestPaid: number;
  x: number;
  y: number;
};

function getChartPoint(
  index: number,
  total: number,
  value: number,
  maxValue: number,
  width: number,
  height: number,
  padding: number,
) {
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const x =
    total <= 1 ? padding : padding + (index / (total - 1)) * plotWidth;
  const y =
    padding +
    plotHeight -
    (maxValue <= 0 ? 0 : (value / maxValue) * plotHeight);

  return { x, y };
}

function createLinePath(
  values: number[],
  maxValue: number,
  width: number,
  height: number,
  padding: number,
) {
  return values
    .map((value, index) => {
      const point = getChartPoint(
        index,
        values.length,
        value,
        maxValue,
        width,
        height,
        padding,
      );
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function createAreaPath(
  values: number[],
  maxValue: number,
  width: number,
  height: number,
  padding: number,
) {
  if (values.length === 0) {
    return "";
  }

  const linePath = createLinePath(values, maxValue, width, height, padding);
  const firstPoint = getChartPoint(
    0,
    values.length,
    values[0],
    maxValue,
    width,
    height,
    padding,
  );
  const lastPoint = getChartPoint(
    values.length - 1,
    values.length,
    values[values.length - 1],
    maxValue,
    width,
    height,
    padding,
  );
  const baseline = height - padding;

  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function EmiPage() {
  const [formValues, setFormValues] = useState({
    principal: "500000",
    annualRatePercentage: "10",
    tenureMonths: "60",
    processingFee: "0",
  });
  const [result, setResult] = useState<EmiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredPayoffPoint, setHoveredPayoffPoint] =
    useState<HoveredPayoffPoint | null>(null);
  const [hoveredSplitPoint, setHoveredSplitPoint] =
    useState<HoveredSplitPoint | null>(null);
  const principal = Number(formValues.principal || 0);
  const annualRatePercentage = Number(formValues.annualRatePercentage || 0);
  const tenureMonths = Math.max(1, Math.round(Number(formValues.tenureMonths || 0)));
  const processingFee = Number(formValues.processingFee || 0);
  const monthlyRate = annualRatePercentage / 12 / 100;
  const growthFactor = Math.pow(1 + monthlyRate, tenureMonths);
  const exactMonthlyInstallment =
    Math.abs(monthlyRate) < 0.0000000001
      ? principal / tenureMonths
      : principal * monthlyRate * growthFactor / (growthFactor - 1);
  const displayedMonthlyInstallment =
    result?.monthlyInstallment ?? exactMonthlyInstallment;
  const displayedTotalInterest =
    result?.totalInterest ?? exactMonthlyInstallment * tenureMonths - principal;
  const displayedTotalPayment =
    result?.totalPayment ?? exactMonthlyInstallment * tenureMonths;
  const totalCostIncludingFee = displayedTotalPayment + processingFee;
  const processingFeePercentage =
    principal > 0 ? (processingFee / principal) * 100 : 0;
  const amortizationSchedule: AmortizationRow[] = [];
  let remainingBalance = principal;

  for (let month = 1; month <= tenureMonths; month += 1) {
    const interestPaid = remainingBalance * monthlyRate;
    let principalPaid = exactMonthlyInstallment - interestPaid;
    let installment = exactMonthlyInstallment;

    if (month === tenureMonths || principalPaid > remainingBalance) {
      principalPaid = remainingBalance;
      installment = principalPaid + interestPaid;
    }

    remainingBalance = Math.max(0, remainingBalance - principalPaid);

    amortizationSchedule.push({
      month,
      installment,
      principalPaid,
      interestPaid,
      closingBalance: remainingBalance,
    });
  }

  const formulaLegendRows = [
    {
      symbol: "EMI",
      meaning: "Equal Monthly Installment paid each month",
    },
    {
      symbol: "P",
      meaning: "Loan principal or amount borrowed",
    },
    {
      symbol: "i",
      meaning: "Monthly interest rate",
    },
    {
      symbol: "n",
      meaning: "Total number of monthly installments",
    },
  ];
  const parameterRows = [
    {
      symbol: "P",
      label: "Loan principal",
      value: formatAmount(principal),
    },
    {
      symbol: "Annual rate",
      label: "Interest rate entered in yearly percentage terms",
      value: `${formatCompactValue(annualRatePercentage)}%`,
    },
    {
      symbol: "i",
      label: "Monthly interest rate used in the EMI formula",
      value: formatCompactValue(monthlyRate),
    },
    {
      symbol: "n",
      label: "Number of monthly installments",
      value: formatCompactValue(tenureMonths),
    },
    {
      symbol: "Fee",
      label: "Manual processing fee added outside the EMI formula",
      value:
        processingFee > 0
          ? `${formatAmount(processingFee)} (${formatCompactValue(processingFeePercentage)}% of principal)`
          : formatAmount(processingFee),
    },
  ];
  const emiFormula =
    Math.abs(monthlyRate) < 0.0000000001
      ? "EMI = P / n"
      : "EMI = P × i × (1 + i)^n / ((1 + i)^n - 1)";
  const emiSubstitution =
    Math.abs(monthlyRate) < 0.0000000001
      ? `EMI = ${formatAmount(principal)} / ${tenureMonths}`
      : `EMI = ${formatAmount(principal)} × ${formatCompactValue(monthlyRate)} × (1 + ${formatCompactValue(monthlyRate)})^${tenureMonths} / (((1 + ${formatCompactValue(monthlyRate)})^${tenureMonths}) - 1)`;
  const interestFormula = "Total interest = (EMI × n) - P";
  const interestSubstitution = `Total interest = (${formatAmount(displayedMonthlyInstallment)} × ${tenureMonths}) - ${formatAmount(principal)}`;
  const feeFormula =
    "Total cost with fee = Total payment + manual processing fee";
  const feeSubstitution = `${formatAmount(displayedTotalPayment)} + ${formatAmount(processingFee)} = ${formatAmount(totalCostIncludingFee)}`;
  const installmentBreakdown =
    Math.abs(monthlyRate) < 0.0000000001
      ? `${formatAmount(principal)} / ${tenureMonths} = ${formatAmount(displayedMonthlyInstallment)}`
      : `${formatAmount(principal)} × ${formatCompactValue(monthlyRate)} × (1 + ${formatCompactValue(monthlyRate)})^${tenureMonths} / (((1 + ${formatCompactValue(monthlyRate)})^${tenureMonths}) - 1) = ${formatAmount(displayedMonthlyInstallment)}`;
  const paymentBreakdown = `${formatAmount(displayedMonthlyInstallment)} × ${tenureMonths} = ${formatAmount(displayedTotalPayment)}`;
  const interestBreakdown = `${formatAmount(displayedTotalPayment)} - ${formatAmount(principal)} = ${formatAmount(displayedTotalInterest)}`;
  const feeBreakdown =
    processingFee > 0
      ? `${formatAmount(displayedTotalPayment)} + ${formatAmount(processingFee)} = ${formatAmount(totalCostIncludingFee)}`
      : `No manual processing fee entered, so total cost stays ${formatAmount(totalCostIncludingFee)}`;
  const payoffChartWidth = 860;
  const payoffChartHeight = 280;
  const chartPadding = 36;
  const closingBalanceSeries = [
    principal,
    ...amortizationSchedule.map((row) => row.closingBalance),
  ];
  const closingBalanceMax = Math.max(1, ...closingBalanceSeries);
  const payoffLinePath = createLinePath(
    closingBalanceSeries,
    closingBalanceMax,
    payoffChartWidth,
    payoffChartHeight,
    chartPadding,
  );
  const payoffAreaPath = createAreaPath(
    closingBalanceSeries,
    closingBalanceMax,
    payoffChartWidth,
    payoffChartHeight,
    chartPadding,
  );
  const payoffPoints = closingBalanceSeries.map((value, index) => {
    const point = getChartPoint(
      index,
      closingBalanceSeries.length,
      value,
      closingBalanceMax,
      payoffChartWidth,
      payoffChartHeight,
      chartPadding,
    );

    return {
      month: index,
      balance: value,
      ...point,
    };
  });
  const payoffTickValues = [closingBalanceMax, closingBalanceMax / 2, 0];
  const splitChartWidth = 860;
  const splitChartHeight = 260;
  const splitPadding = 36;
  const splitPlotWidth = splitChartWidth - splitPadding * 2;
  const splitPlotHeight = splitChartHeight - splitPadding * 2;
  const maxInstallmentComponent = Math.max(
    1,
    ...amortizationSchedule.map((row) => row.installment),
  );
  const barSlotWidth =
    amortizationSchedule.length > 0
      ? splitPlotWidth / amortizationSchedule.length
      : splitPlotWidth;
  const barWidth = Math.max(3, barSlotWidth * 0.72);
  const splitTickValues = [maxInstallmentComponent, maxInstallmentComponent / 2, 0];
  const splitBars = amortizationSchedule.map((row, index) => {
    const baseX =
      splitPadding + index * barSlotWidth + (barSlotWidth - barWidth) / 2;
    const principalHeight =
      (row.principalPaid / maxInstallmentComponent) * splitPlotHeight;
    const interestHeight =
      (row.interestPaid / maxInstallmentComponent) * splitPlotHeight;
    const chartBottom = splitPadding + splitPlotHeight;
    const principalY = chartBottom - principalHeight;
    const interestY = principalY - interestHeight;

    return {
      ...row,
      baseX,
      principalHeight,
      interestHeight,
      principalY,
      interestY,
      slotX: splitPadding + index * barSlotWidth,
      centerX: baseX + barWidth / 2,
    };
  });
  const payoffLabelMonths = Array.from(
    new Set([0, Math.floor(tenureMonths / 2), tenureMonths]),
  );
  const splitLabelMonths = Array.from(
    new Set([1, Math.max(1, Math.ceil(tenureMonths / 2)), tenureMonths]),
  );
  const payoffTooltipWidth = 154;
  const payoffTooltipHeight = 58;
  const payoffTooltipX = hoveredPayoffPoint
    ? clamp(
        hoveredPayoffPoint.x + 12,
        chartPadding,
        payoffChartWidth - payoffTooltipWidth - chartPadding,
      )
    : 0;
  const payoffTooltipY = hoveredPayoffPoint
    ? hoveredPayoffPoint.y > payoffTooltipHeight + chartPadding
      ? hoveredPayoffPoint.y - payoffTooltipHeight - 10
      : hoveredPayoffPoint.y + 12
    : 0;
  const splitTooltipWidth = 172;
  const splitTooltipHeight = 90;
  const splitTooltipX = hoveredSplitPoint
    ? clamp(
        hoveredSplitPoint.x + 12,
        splitPadding,
        splitChartWidth - splitTooltipWidth - splitPadding,
      )
    : 0;
  const splitTooltipY = hoveredSplitPoint
    ? hoveredSplitPoint.y > splitTooltipHeight + splitPadding
      ? hoveredSplitPoint.y - splitTooltipHeight - 10
      : hoveredSplitPoint.y + 12
    : 0;

  function handleDownloadSchedule() {
    const csvRows: Array<Array<string | number>> = [
      ["Loan Summary"],
      ["Principal", formatCsvNumber(principal)],
      ["Annual Rate (%)", formatCsvNumber(annualRatePercentage, 4)],
      ["Monthly Rate", formatCsvNumber(monthlyRate, 6)],
      ["Tenure (Months)", tenureMonths],
      ["Monthly Installment", formatCsvNumber(displayedMonthlyInstallment)],
      ["Total Interest", formatCsvNumber(displayedTotalInterest)],
      ["Total Payment", formatCsvNumber(displayedTotalPayment)],
      ["Processing Fee", formatCsvNumber(processingFee)],
      ["Total Cost Including Fee", formatCsvNumber(totalCostIncludingFee)],
      [],
      [
        "Month",
        "Installment",
        "Principal",
        "Interest",
        "Closing Balance",
      ],
      ...amortizationSchedule.map((row) => [
        row.month,
        formatCsvNumber(row.installment),
        formatCsvNumber(row.principalPaid),
        formatCsvNumber(row.interestPaid),
        formatCsvNumber(row.closingBalance),
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((value) => csvEscape(value)).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `emi-amortization-schedule-${tenureMonths}m.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    setHoveredPayoffPoint(null);
    setHoveredSplitPoint(null);
    if (name !== "processingFee") {
      setResult(null);
    }
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const payload: EmiRequest = {
      principal,
      annualRatePercentage,
      tenureMonths,
    };

    try {
      const response = await calculateEmi(payload);
      setResult(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to calculate EMI right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFormValues({
      principal: "500000",
      annualRatePercentage: "10",
      tenureMonths: "60",
      processingFee: "0",
    });
    setResult(null);
    setErrorMessage("");
    setHoveredPayoffPoint(null);
    setHoveredSplitPoint(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Utility 3"
        title="EMI Calculator"
        description="Estimate monthly repayment, total payment, and total interest for loans. This is useful for equipment financing, working capital loans, or customer financing simulations."
      />

      <section className="panel form-layout">
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>Loan Inputs</h2>
          <p className="helper-copy">
            Compare financing scenarios before you commit to a repayment plan.
          </p>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="principal">Loan amount</label>
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

            <div className="field field--full">
              <label htmlFor="tenureMonths">Tenure (months)</label>
              <input
                id="tenureMonths"
                name="tenureMonths"
                type="number"
                min="1"
                step="1"
                value={formValues.tenureMonths}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field field--full">
              <label htmlFor="processingFee">
                Processing fee (optional manual value)
              </label>
              <input
                id="processingFee"
                name="processingFee"
                type="number"
                min="0"
                step="0.01"
                value={formValues.processingFee}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Calculate EMI"}
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
          <h2>Repayment Summary</h2>
          <p className="helper-copy">
            Keep the same currency unit across all fields to interpret results
            correctly. Processing fee is treated as an upfront manual charge and
            does not change EMI unless you choose to add it into the principal
            later.
          </p>

          {result ? (
            <>
              <div className="result-grid">
                <div className="metric-card">
                  <p className="metric-card__label">Monthly installment</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.monthlyInstallment)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Total interest</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.totalInterest)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Total payment</p>
                  <p className="metric-card__value">
                    {amountFormatter.format(result.totalPayment)}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Processing fee</p>
                  <p className="metric-card__value">
                    {formatAmount(processingFee)}
                  </p>
                  <p className="metric-card__meta">
                    {processingFee > 0
                      ? `${formatCompactValue(processingFeePercentage)}% of principal`
                      : "Optional manual charge"}
                  </p>
                </div>

                <div className="metric-card">
                  <p className="metric-card__label">Total cost incl. fee</p>
                  <p className="metric-card__value">
                    {formatAmount(totalCostIncludingFee)}
                  </p>
                </div>
              </div>

              <div className="breakdown-panel">
                <p className="breakdown-panel__eyebrow">
                  How the final answer was calculated
                </p>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">1. Monthly rate</p>
                  <p className="breakdown-step__value">
                    {formatCompactValue(annualRatePercentage)}% / 12 / 100 ={" "}
                    {formatCompactValue(monthlyRate)}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">
                    2. Monthly installment
                  </p>
                  <p className="breakdown-step__value">
                    {installmentBreakdown}
                  </p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">3. Total payment</p>
                  <p className="breakdown-step__value">{paymentBreakdown}</p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">4. Total interest</p>
                  <p className="breakdown-step__value">{interestBreakdown}</p>
                </div>
                <div className="breakdown-step">
                  <p className="breakdown-step__label">
                    5. Total cost including fee
                  </p>
                  <p className="breakdown-step__value">{feeBreakdown}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="metric-card">
              <p className="metric-card__label">No calculation yet</p>
              <p className="metric-card__meta">
                Submit a loan amount, annual rate, and tenure to generate a
                repayment summary.
              </p>
            </div>
          )}
        </aside>
      </section>

      <section className="panel schedule-panel">
        <div className="schedule-panel__header">
          <div>
            <h2>Amortization Schedule</h2>
            <p className="helper-copy">
              Month-by-month view of how each installment is split into
              interest and principal, and how the outstanding balance declines.
            </p>
          </div>
          <p className="schedule-panel__meta">
            {tenureMonths} months • {formatAmount(displayedMonthlyInstallment)}{" "}
            standard EMI
          </p>
        </div>

        <div className="schedule-panel__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={handleDownloadSchedule}
          >
            Download CSV
          </button>
        </div>

        <div className="chart-grid">
          <section className="chart-card">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Outstanding Balance Curve</h3>
                <p className="chart-card__subtitle">
                  Shows how the remaining loan balance drops over time.
                </p>
              </div>
              <div className="chart-legend">
                <span className="chart-legend__item">
                  <span className="chart-swatch chart-swatch--purple" />
                  Closing balance
                </span>
              </div>
            </div>

            <div className="chart-scroll">
              <svg
                className="chart-svg"
                viewBox={`0 0 ${payoffChartWidth} ${payoffChartHeight}`}
                role="img"
                aria-label="Outstanding balance over time"
                onMouseLeave={() => setHoveredPayoffPoint(null)}
              >
                {payoffTickValues.map((tickValue) => {
                  const tickPoint = getChartPoint(
                    0,
                    2,
                    tickValue,
                    closingBalanceMax,
                    payoffChartWidth,
                    payoffChartHeight,
                    chartPadding,
                  );

                  return (
                    <g key={tickValue}>
                      <line
                        className="chart-grid-line"
                        x1={chartPadding}
                        x2={payoffChartWidth - chartPadding}
                        y1={tickPoint.y}
                        y2={tickPoint.y}
                      />
                      <text
                        className="chart-axis-label"
                        x={8}
                        y={tickPoint.y + 4}
                      >
                        {formatAmount(tickValue)}
                      </text>
                    </g>
                  );
                })}

                <path className="chart-area chart-area--purple" d={payoffAreaPath} />
                <path className="chart-line chart-line--purple" d={payoffLinePath} />
                {hoveredPayoffPoint ? (
                  <line
                    className="chart-guide-line"
                    x1={hoveredPayoffPoint.x}
                    x2={hoveredPayoffPoint.x}
                    y1={chartPadding}
                    y2={payoffChartHeight - chartPadding}
                  />
                ) : null}

                {payoffPoints.map((point) => (
                  <g key={point.month}>
                    <circle
                      className="chart-point-hit"
                      cx={point.x}
                      cy={point.y}
                      r={10}
                      tabIndex={0}
                      aria-label={`Month ${point.month}, closing balance ${formatAmount(point.balance)}`}
                      onMouseEnter={() => setHoveredPayoffPoint(point)}
                      onFocus={() => setHoveredPayoffPoint(point)}
                      onBlur={() => setHoveredPayoffPoint(null)}
                    />
                    <circle
                      className={`chart-point ${
                        hoveredPayoffPoint?.month === point.month
                          ? "chart-point--active"
                          : ""
                      }`.trim()}
                      cx={point.x}
                      cy={point.y}
                      r={hoveredPayoffPoint?.month === point.month ? 5.5 : 3.5}
                    />
                  </g>
                ))}

                {hoveredPayoffPoint ? (
                  <g className="chart-tooltip">
                    <rect
                      className="chart-tooltip__box"
                      x={payoffTooltipX}
                      y={payoffTooltipY}
                      width={payoffTooltipWidth}
                      height={payoffTooltipHeight}
                      rx={12}
                    />
                    <text
                      className="chart-tooltip__title"
                      x={payoffTooltipX + 12}
                      y={payoffTooltipY + 22}
                    >
                      Month {hoveredPayoffPoint.month}
                    </text>
                    <text
                      className="chart-tooltip__value"
                      x={payoffTooltipX + 12}
                      y={payoffTooltipY + 42}
                    >
                      Balance: {formatAmount(hoveredPayoffPoint.balance)}
                    </text>
                  </g>
                ) : null}

                {payoffLabelMonths.map((monthValue) => {
                    const point = getChartPoint(
                      monthValue,
                      tenureMonths + 1,
                      0,
                      1,
                      payoffChartWidth,
                      payoffChartHeight,
                      chartPadding,
                    );

                    return (
                      <text
                        key={monthValue}
                        className="chart-axis-label"
                        x={point.x}
                        y={payoffChartHeight - 10}
                        textAnchor={
                          monthValue === 0
                            ? "start"
                            : monthValue === tenureMonths
                              ? "end"
                              : "middle"
                        }
                      >
                        Month {monthValue}
                      </text>
                    );
                  })}
              </svg>
            </div>
          </section>

          <section className="chart-card">
            <div className="chart-card__header">
              <div>
                <h3 className="chart-card__title">Principal vs Interest Split</h3>
                <p className="chart-card__subtitle">
                  Each bar is one EMI, split into principal repayment and interest.
                </p>
              </div>
              <div className="chart-legend">
                <span className="chart-legend__item">
                  <span className="chart-swatch chart-swatch--green" />
                  Principal
                </span>
                <span className="chart-legend__item">
                  <span className="chart-swatch chart-swatch--pink" />
                  Interest
                </span>
              </div>
            </div>

            <div className="chart-scroll">
              <svg
                className="chart-svg"
                viewBox={`0 0 ${splitChartWidth} ${splitChartHeight}`}
                role="img"
                aria-label="Monthly EMI split between principal and interest"
                onMouseLeave={() => setHoveredSplitPoint(null)}
              >
                {splitTickValues.map((tickValue) => {
                  const tickPoint = getChartPoint(
                    0,
                    2,
                    tickValue,
                    maxInstallmentComponent,
                    splitChartWidth,
                    splitChartHeight,
                    splitPadding,
                  );

                  return (
                    <g key={tickValue}>
                      <line
                        className="chart-grid-line"
                        x1={splitPadding}
                        x2={splitChartWidth - splitPadding}
                        y1={tickPoint.y}
                        y2={tickPoint.y}
                      />
                      <text
                        className="chart-axis-label"
                        x={8}
                        y={tickPoint.y + 4}
                      >
                        {formatAmount(tickValue)}
                      </text>
                    </g>
                  );
                })}

                {splitBars.map((row) => {
                  const isActive = hoveredSplitPoint?.month === row.month;

                  return (
                    <g
                      key={row.month}
                      tabIndex={0}
                      aria-label={`Month ${row.month}, principal ${formatAmount(row.principalPaid)}, interest ${formatAmount(row.interestPaid)}`}
                      onMouseEnter={() =>
                        setHoveredSplitPoint({
                          month: row.month,
                          installment: row.installment,
                          principalPaid: row.principalPaid,
                          interestPaid: row.interestPaid,
                          x: row.centerX,
                          y: row.interestY,
                        })
                      }
                      onFocus={() =>
                        setHoveredSplitPoint({
                          month: row.month,
                          installment: row.installment,
                          principalPaid: row.principalPaid,
                          interestPaid: row.interestPaid,
                          x: row.centerX,
                          y: row.interestY,
                        })
                      }
                      onBlur={() => setHoveredSplitPoint(null)}
                    >
                      <rect
                        className="chart-hover-zone"
                        x={row.slotX}
                        y={splitPadding}
                        width={barSlotWidth}
                        height={splitPlotHeight}
                      />
                      <rect
                        className={`chart-bar chart-bar--green ${
                          isActive ? "chart-bar--active" : ""
                        }`.trim()}
                        x={row.baseX}
                        y={row.principalY}
                        width={barWidth}
                        height={row.principalHeight}
                        rx={Math.min(4, barWidth / 2)}
                      />
                      <rect
                        className={`chart-bar chart-bar--pink ${
                          isActive ? "chart-bar--active" : ""
                        }`.trim()}
                        x={row.baseX}
                        y={row.interestY}
                        width={barWidth}
                        height={row.interestHeight}
                        rx={Math.min(4, barWidth / 2)}
                      />
                    </g>
                  );
                })}

                {hoveredSplitPoint ? (
                  <g className="chart-tooltip">
                    <rect
                      className="chart-tooltip__box"
                      x={splitTooltipX}
                      y={splitTooltipY}
                      width={splitTooltipWidth}
                      height={splitTooltipHeight}
                      rx={12}
                    />
                    <text
                      className="chart-tooltip__title"
                      x={splitTooltipX + 12}
                      y={splitTooltipY + 20}
                    >
                      Month {hoveredSplitPoint.month}
                    </text>
                    <text
                      className="chart-tooltip__value"
                      x={splitTooltipX + 12}
                      y={splitTooltipY + 38}
                    >
                      Principal: {formatAmount(hoveredSplitPoint.principalPaid)}
                    </text>
                    <text
                      className="chart-tooltip__value"
                      x={splitTooltipX + 12}
                      y={splitTooltipY + 56}
                    >
                      Interest: {formatAmount(hoveredSplitPoint.interestPaid)}
                    </text>
                    <text
                      className="chart-tooltip__value"
                      x={splitTooltipX + 12}
                      y={splitTooltipY + 74}
                    >
                      EMI: {formatAmount(hoveredSplitPoint.installment)}
                    </text>
                  </g>
                ) : null}

                {splitLabelMonths.map((monthValue) => {
                    const x =
                      splitPadding +
                      ((monthValue - 1) / Math.max(1, tenureMonths - 1)) *
                        splitPlotWidth;

                    return (
                      <text
                        key={monthValue}
                        className="chart-axis-label"
                        x={x}
                        y={splitChartHeight - 10}
                        textAnchor={
                          monthValue === 1
                            ? "start"
                            : monthValue === tenureMonths
                              ? "end"
                              : "middle"
                        }
                      >
                        Month {monthValue}
                      </text>
                    );
                  })}
              </svg>
            </div>
          </section>
        </div>

        <div className="schedule-table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Installment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Closing Balance</th>
              </tr>
            </thead>
            <tbody>
              {amortizationSchedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatAmount(row.installment)}</td>
                  <td>{formatAmount(row.principalPaid)}</td>
                  <td>{formatAmount(row.interestPaid)}</td>
                  <td>{formatAmount(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="schedule-panel__actions schedule-panel__actions--bottom">
          <button
            className="button button--secondary"
            type="button"
            onClick={handleDownloadSchedule}
          >
            Download CSV
          </button>
        </div>
      </section>

      <section className="panel learning-panel">
        <div className="learning-section">
          <h2>Formulas Used</h2>
          <p className="helper-copy">
            The EMI calculation uses the standard reducing-balance loan formula.
            A separate fee summary is shown because manual processing fees are
            not part of the EMI formula by default.
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
              <p className="formula-card__title">EMI formula</p>
              <p className="formula-block">{emiFormula}</p>
              <p className="formula-note">{emiSubstitution}</p>
            </div>

            <div className="formula-card">
              <p className="formula-card__title">Interest formula</p>
              <p className="formula-block">{interestFormula}</p>
              <p className="formula-note">{interestSubstitution}</p>
            </div>

            <div className="formula-card">
              <p className="formula-card__title">Fee-adjusted cost</p>
              <p className="formula-block">{feeFormula}</p>
              <p className="formula-note">{feeSubstitution}</p>
            </div>
          </div>
        </div>

        <aside className="learning-section">
          <h2>Parameters Used</h2>
          <p className="helper-copy">
            These are the values currently being plugged into the EMI
            calculations.
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
