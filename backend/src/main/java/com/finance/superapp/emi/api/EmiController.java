package com.finance.superapp.emi.api;

import com.finance.superapp.emi.domain.EmiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/utilities/emi")
public class EmiController {

    private final EmiService emiService;

    public EmiController(EmiService emiService) {
        this.emiService = emiService;
    }

    @PostMapping("/calculate")
    public EmiResponse calculate(@Valid @RequestBody EmiRequest request) {
        return emiService.calculate(request);
    }
}
