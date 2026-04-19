package com.finance.superapp.utilitycatalog;

import com.finance.superapp.utilitycatalog.api.UtilitySummary;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UtilityCatalogService {

    public List<UtilitySummary> listUtilities() {
        return List.of(
                        new UtilitySummary(
                                "calculator",
                                "Calculator",
                                "Simple and scientific calculator for everyday business math.",
                                "/utilities/calculator",
                                List.of("math", "scientific", "simple", "operations")
                        ),
                        new UtilitySummary(
                                "compound-interest",
                                "Compound Interest Calculator",
                                "Project investment growth with annual, biannual, monthly, or daily compounding.",
                                "/utilities/compound-interest",
                                List.of("returns", "growth", "investment", "savings")
                        ),
                        new UtilitySummary(
                                "emi",
                                "EMI Calculator",
                                "Estimate equated monthly installments, total payment, and total interest.",
                                "/utilities/emi",
                                List.of("loan", "installment", "repayment", "interest")
                        )
                )
                .stream()
                .sorted(Comparator.comparing(UtilitySummary::title))
                .toList();
    }
}
