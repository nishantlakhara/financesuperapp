package com.finance.superapp.calculator;

import static org.assertj.core.api.Assertions.assertThat;

import com.finance.superapp.calculator.api.CalculatorRequest;
import com.finance.superapp.calculator.domain.CalculationMode;
import com.finance.superapp.calculator.domain.CalculatorService;
import com.finance.superapp.calculator.domain.ExpressionEvaluator;
import org.junit.jupiter.api.Test;

class CalculatorServiceTest {

    private final CalculatorService calculatorService = new CalculatorService(new ExpressionEvaluator());

    @Test
    void evaluatesSimpleExpressions() {
        var response = calculatorService.evaluate(new CalculatorRequest("2 + 3 * 4", CalculationMode.SIMPLE));
        assertThat(response.result()).isEqualByComparingTo("14");
    }

    @Test
    void evaluatesScientificExpressions() {
        var response = calculatorService.evaluate(new CalculatorRequest("sqrt(81)+sin(30)", CalculationMode.SCIENTIFIC));
        assertThat(response.result()).isEqualByComparingTo("9.5");
    }
}
