package com.finance.superapp.calculator.domain;

import com.finance.superapp.calculator.api.CalculatorRequest;
import com.finance.superapp.calculator.api.CalculatorResponse;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    private final ExpressionEvaluator expressionEvaluator;

    public CalculatorService(ExpressionEvaluator expressionEvaluator) {
        this.expressionEvaluator = expressionEvaluator;
    }

    public CalculatorResponse evaluate(CalculatorRequest request) {
        double result = expressionEvaluator.evaluate(request.expression(), request.mode());
        BigDecimal normalizedResult = BigDecimal.valueOf(result).stripTrailingZeros();
        return new CalculatorResponse(request.expression().trim(), request.mode(), normalizedResult);
    }
}
