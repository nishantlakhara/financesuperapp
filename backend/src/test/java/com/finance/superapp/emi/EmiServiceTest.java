package com.finance.superapp.emi;

import static org.assertj.core.api.Assertions.assertThat;

import com.finance.superapp.emi.api.EmiRequest;
import com.finance.superapp.emi.domain.EmiService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class EmiServiceTest {

    private final EmiService emiService = new EmiService();

    @Test
    void calculatesMonthlyInstallmentAndTotals() {
        EmiRequest request = new EmiRequest(new BigDecimal("500000"), new BigDecimal("10"), 60);

        var response = emiService.calculate(request);

        assertThat(response.monthlyInstallment()).isEqualByComparingTo("10623.52");
        assertThat(response.totalInterest()).isEqualByComparingTo("137411.34");
        assertThat(response.totalPayment()).isEqualByComparingTo("637411.34");
    }
}
