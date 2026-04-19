package com.finance.superapp.utilitycatalog.api;

import java.util.List;

public record UtilitySummary(
        String slug,
        String title,
        String description,
        String route,
        List<String> keywords
) {
}
