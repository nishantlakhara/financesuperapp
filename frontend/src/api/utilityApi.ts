import { request } from "./client";
import type {
  CalculatorRequest,
  CalculatorResponse,
  CompoundInterestRequest,
  CompoundInterestResponse,
  EmiRequest,
  EmiResponse,
} from "../types/calculators";
import type { UtilitySummary } from "../types/utility";

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

export function fetchUtilities() {
  return request<UtilitySummary[]>("/utilities");
}

export function calculateCompoundInterest(payload: CompoundInterestRequest) {
  return request<CompoundInterestResponse>("/utilities/compound-interest/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function evaluateExpression(payload: CalculatorRequest) {
  return request<CalculatorResponse>("/utilities/calculator/evaluate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function calculateEmi(payload: EmiRequest) {
  return request<EmiResponse>("/utilities/emi/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
