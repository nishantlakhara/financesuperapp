import { create, all, MathJsStatic } from "mathjs";
import type {
  CalculatorRequest,
  CalculatorResponse,
  CompoundInterestRequest,
  CompoundInterestResponse,
  CompoundingFrequency,
  EmiRequest,
  EmiResponse,
} from "../types/calculators";
import type { UtilitySummary } from "../types/utility";

const math: MathJsStatic = create(all);

export const defaultUtilities: UtilitySummary[] = [
  {
    slug: "calculator",
    title: "Calculator",
    description: "Simple and scientific calculator for everyday business math.",
    route: "/utilities/calculator",
    keywords: ["math", "scientific", "simple", "operations"],
  },
  {
    slug: "compound-interest",
    title: "Compound Interest Calculator",
    description:
      "Project investment growth with annual, biannual, monthly, or daily compounding.",
    route: "/utilities/compound-interest",
    keywords: ["returns", "growth", "investment", "savings"],
  },
  {
    slug: "emi",
    title: "EMI Calculator",
    description:
      "Estimate equated monthly installments, total payment, and total interest.",
    route: "/utilities/emi",
    keywords: ["loan", "installment", "repayment", "interest"],
  },
];

export function fetchUtilities(): UtilitySummary[] {
  return defaultUtilities;
}

export function evaluateExpression(payload: CalculatorRequest): CalculatorResponse {
  const expression = payload.expression
    .replace(/sin\(/g, "sin(deg(")
    .replace(/cos\(/g, "cos(deg(")
    .replace(/tan\(/g, "tan(deg(");

  const result = math.evaluate(expression) as number;

  return {
    expression: payload.expression,
    mode: payload.mode,
    result: isNaN(result) || !isFinite(result) ? 0 : result,
  };
}

const periodsPerYearByFrequency: Record<CompoundingFrequency, number> = {
  ANNUALLY: 1,
  BIANNUALLY: 2,
  MONTHLY: 12,
  DAILY: 365,
};

export function calculateCompoundInterest(
  payload: CompoundInterestRequest,
): CompoundInterestResponse {
  const { principal, annualRatePercentage, years, compoundingFrequency, periodicContribution = 0 } = payload;
  const periodsPerYear = periodsPerYearByFrequency[compoundingFrequency];
  const periodicRate = annualRatePercentage / 100 / periodsPerYear;
  const totalPeriods = Math.round(years * periodsPerYear);

  const growthFactor = Math.pow(1 + periodicRate, totalPeriods);
  const principalFutureValue = principal * growthFactor;

  let contributionFutureValue = 0;
  if (periodicContribution > 0) {
    if (Math.abs(periodicRate) < 1e-10) {
      contributionFutureValue = periodicContribution * totalPeriods;
    } else {
      contributionFutureValue = periodicContribution * ((growthFactor - 1) / periodicRate);
    }
  }

  const maturityAmount = principalFutureValue + contributionFutureValue;
  const totalContributions = principal + periodicContribution * totalPeriods;
  const totalInterestEarned = maturityAmount - totalContributions;

  const effectiveAnnualRate = Math.pow(1 + periodicRate, periodsPerYear) - 1;

  return {
    maturityAmount,
    totalContributions,
    totalInterestEarned,
    effectiveAnnualRatePercentage: effectiveAnnualRate * 100,
    totalPeriods,
    compoundingFrequency,
  };
}

export function calculateEmi(payload: EmiRequest): EmiResponse {
  const { principal, annualRatePercentage, tenureMonths } = payload;

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyInstallment: 0,
      totalInterest: 0,
      totalPayment: 0,
    };
  }

  let monthlyInstallment: number;

  if (annualRatePercentage === 0) {
    monthlyInstallment = principal / tenureMonths;
  } else {
    const monthlyRate = annualRatePercentage / 100 / 12;
    monthlyInstallment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  const totalPayment = monthlyInstallment * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    monthlyInstallment,
    totalInterest,
    totalPayment,
  };
}
