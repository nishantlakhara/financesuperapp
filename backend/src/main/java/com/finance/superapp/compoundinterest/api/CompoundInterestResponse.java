package com.finance.superapp.compoundinterest.api;

import com.finance.superapp.compoundinterest.domain.CompoundingFrequency;
import java.math.BigDecimal;

public record CompoundInterestResponse(
        BigDecimal maturityAmount,
        BigDecimal totalContributions,
        BigDecimal totalInterestEarned,
        BigDecimal effectiveAnnualRatePercentage,
        int totalPeriods,
        CompoundingFrequency compoundingFrequency
) {
}
