package com.finance.superapp.emi.api;

import java.math.BigDecimal;

public record EmiResponse(
        BigDecimal monthlyInstallment,
        BigDecimal totalInterest,
        BigDecimal totalPayment
) {
}
