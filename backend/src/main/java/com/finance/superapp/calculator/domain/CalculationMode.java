package com.finance.superapp.calculator.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.Locale;

public enum CalculationMode {
    SIMPLE,
    SCIENTIFIC;

    @JsonCreator
    public static CalculationMode fromValue(String value) {
        return CalculationMode.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
