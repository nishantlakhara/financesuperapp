export type CompoundingFrequency =
  | "ANNUALLY"
  | "BIANNUALLY"
  | "MONTHLY"
  | "DAILY";

export type CompoundInterestRequest = {
  principal: number;
  annualRatePercentage: number;
  years: number;
  compoundingFrequency: CompoundingFrequency;
  periodicContribution?: number;
};

export type CompoundInterestResponse = {
  maturityAmount: number;
  totalContributions: number;
  totalInterestEarned: number;
  effectiveAnnualRatePercentage: number;
  totalPeriods: number;
  compoundingFrequency: CompoundingFrequency;
};

export type CalculationMode = "SIMPLE" | "SCIENTIFIC";

export type CalculatorRequest = {
  expression: string;
  mode: CalculationMode;
};

export type CalculatorResponse = {
  expression: string;
  mode: CalculationMode;
  result: number;
};

export type EmiRequest = {
  principal: number;
  annualRatePercentage: number;
  tenureMonths: number;
};

export type EmiResponse = {
  monthlyInstallment: number;
  totalInterest: number;
  totalPayment: number;
};
