package com.finance.superapp.calculator.api;

import com.finance.superapp.calculator.domain.CalculatorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/utilities/calculator")
public class CalculatorController {

    private final CalculatorService calculatorService;

    public CalculatorController(CalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @PostMapping("/evaluate")
    public CalculatorResponse evaluate(@Valid @RequestBody CalculatorRequest request) {
        return calculatorService.evaluate(request);
    }
}
