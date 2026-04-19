package com.finance.superapp.compoundinterest.domain;

import com.finance.superapp.compoundinterest.api.CompoundInterestRequest;
import com.finance.superapp.compoundinterest.api.CompoundInterestResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;

@Service
public class CompoundInterestService {

    public CompoundInterestResponse calculate(CompoundInterestRequest request) {
        double principal = request.principal().doubleValue();
        double annualRate = request.annualRatePercentage().doubleValue() / 100D;
        double years = request.years().doubleValue();
        int periodsPerYear = request.compoundingFrequency().periodsPerYear();
        int totalPeriods = Math.max(1, (int) Math.round(years * periodsPerYear));
        double periodicContribution = request.periodicContribution() == null
                ? 0D
                : request.periodicContribution().doubleValue();

        double ratePerPeriod = annualRate / periodsPerYear;
        double growthFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
        double futureValue = principal * growthFactor;

        if (periodicContribution > 0) {
            futureValue += Math.abs(ratePerPeriod) < 0.0000000001
                    ? periodicContribution * totalPeriods
                    : periodicContribution * ((growthFactor - 1) / ratePerPeriod);
        }

        double totalContributions = principal + (periodicContribution * totalPeriods);
        double interestEarned = futureValue - totalContributions;
        double effectiveAnnualRate = (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100;

        return new CompoundInterestResponse(
                scale(futureValue),
                scale(totalContributions),
                scale(interestEarned),
                scale(effectiveAnnualRate),
                totalPeriods,
                request.compoundingFrequency()
        );
    }

    private BigDecimal scale(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
