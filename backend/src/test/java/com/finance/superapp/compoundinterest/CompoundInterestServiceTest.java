package com.finance.superapp.compoundinterest;

import static org.assertj.core.api.Assertions.assertThat;

import com.finance.superapp.compoundinterest.api.CompoundInterestRequest;
import com.finance.superapp.compoundinterest.domain.CompoundInterestService;
import com.finance.superapp.compoundinterest.domain.CompoundingFrequency;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CompoundInterestServiceTest {

    private final CompoundInterestService compoundInterestService = new CompoundInterestService();

    @Test
    void calculatesCompoundInterestWithRecurringContribution() {
        CompoundInterestRequest request = new CompoundInterestRequest(
                new BigDecimal("10000"),
                new BigDecimal("8"),
                new BigDecimal("5"),
                CompoundingFrequency.MONTHLY,
                new BigDecimal("250")
        );

        var response = compoundInterestService.calculate(request);

        assertThat(response.maturityAmount()).isEqualByComparingTo("33267.67");
        assertThat(response.totalContributions()).isEqualByComparingTo("25000.00");
        assertThat(response.totalInterestEarned()).isEqualByComparingTo("8267.67");
        assertThat(response.totalPeriods()).isEqualTo(60);
    }
}
