package com.finance.superapp.compoundinterest.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.Locale;

public enum CompoundingFrequency {
    ANNUALLY(1),
    BIANNUALLY(2),
    MONTHLY(12),
    DAILY(365);

    private final int periodsPerYear;

    CompoundingFrequency(int periodsPerYear) {
        this.periodsPerYear = periodsPerYear;
    }

    public int periodsPerYear() {
        return periodsPerYear;
    }

    @JsonCreator
    public static CompoundingFrequency fromValue(String value) {
        return CompoundingFrequency.valueOf(
                value.trim()
                        .replace('-', '_')
                        .replace(' ', '_')
                        .toUpperCase(Locale.ROOT)
        );
    }
}
