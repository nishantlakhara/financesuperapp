package com.finance.superapp.calculator.api;

import com.finance.superapp.calculator.domain.CalculationMode;
import java.math.BigDecimal;

public record CalculatorResponse(
        String expression,
        CalculationMode mode,
        BigDecimal result
) {
}
