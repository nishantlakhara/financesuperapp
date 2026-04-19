package com.finance.superapp.calculator.api;

import com.finance.superapp.calculator.domain.CalculationMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CalculatorRequest(
        @NotBlank(message = "expression cannot be blank")
        String expression,
        @NotNull
        CalculationMode mode
) {
}
