package com.finance.superapp.emi.domain;

import com.finance.superapp.emi.api.EmiRequest;
import com.finance.superapp.emi.api.EmiResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;

@Service
public class EmiService {

    public EmiResponse calculate(EmiRequest request) {
        double principal = request.principal().doubleValue();
        int tenureMonths = request.tenureMonths();
        double monthlyRate = request.annualRatePercentage().doubleValue() / 12D / 100D;

        double emi = monthlyRate == 0
                ? principal / tenureMonths
                : principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)
                / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        double totalPayment = emi * tenureMonths;
        double totalInterest = totalPayment - principal;

        return new EmiResponse(
                scale(emi),
                scale(totalInterest),
                scale(totalPayment)
        );
    }

    private BigDecimal scale(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
