package com.finance.superapp.utilitycatalog.api;

import com.finance.superapp.utilitycatalog.UtilityCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/utilities")
public class UtilityCatalogController {

    private final UtilityCatalogService utilityCatalogService;

    public UtilityCatalogController(UtilityCatalogService utilityCatalogService) {
        this.utilityCatalogService = utilityCatalogService;
    }

    @GetMapping
    public List<UtilitySummary> listUtilities() {
        return utilityCatalogService.listUtilities();
    }
}
