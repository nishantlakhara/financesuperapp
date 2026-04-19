package com.finance.superapp.compoundinterest.api;

import com.finance.superapp.compoundinterest.domain.CompoundingFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CompoundInterestRequest(
        @NotNull @DecimalMin(value = "0.01", message = "principal must be greater than zero")
        BigDecimal principal,
        @NotNull @DecimalMin(value = "0.00", message = "annualRatePercentage cannot be negative")
        BigDecimal annualRatePercentage,
        @NotNull @DecimalMin(value = "0.01", message = "years must be greater than zero")
        BigDecimal years,
        @NotNull
        CompoundingFrequency compoundingFrequency,
        @DecimalMin(value = "0.00", message = "periodicContribution cannot be negative")
        BigDecimal periodicContribution
) {
}
