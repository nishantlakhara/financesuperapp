package com.finance.superapp.emi.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EmiRequest(
        @NotNull @DecimalMin(value = "0.01", message = "principal must be greater than zero")
        BigDecimal principal,
        @NotNull @DecimalMin(value = "0.00", message = "annualRatePercentage cannot be negative")
        BigDecimal annualRatePercentage,
        @NotNull @DecimalMin(value = "1", message = "tenureMonths must be at least 1")
        Integer tenureMonths
) {
}
