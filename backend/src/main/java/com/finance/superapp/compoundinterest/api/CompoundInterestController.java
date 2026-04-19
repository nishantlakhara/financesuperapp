package com.finance.superapp.compoundinterest.api;

import com.finance.superapp.compoundinterest.domain.CompoundInterestService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/utilities/compound-interest")
public class CompoundInterestController {

    private final CompoundInterestService compoundInterestService;

    public CompoundInterestController(CompoundInterestService compoundInterestService) {
        this.compoundInterestService = compoundInterestService;
    }

    @PostMapping("/calculate")
    public CompoundInterestResponse calculate(@Valid @RequestBody CompoundInterestRequest request) {
        return compoundInterestService.calculate(request);
    }
}
