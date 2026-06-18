package com.dfcc.dashboard.util;

import java.util.List;
import java.util.Locale;

/**
 * Maps RECARDREQUEST.REQUESTREASONCODE values to dashboard reason buckets.
 * Live Oracle schema uses REQUESTREASONCODE (not REASON).
 */
public final class RecardReasonMapper {

    private static final List<String> PRODUCT_CHANGE_CODES = List.of("PRCH", "PC01", "PC02");
    private static final List<String> REPLACEMENT_CODES = List.of("CR01", "CRPL", "REPL", "RPLC");

    private RecardReasonMapper() {}

    public static List<String> codesForApiReason(String apiReason) {
        if (apiReason == null || apiReason.isBlank()) {
            return List.of();
        }
        if ("Product Change".equalsIgnoreCase(apiReason.trim())) {
            return PRODUCT_CHANGE_CODES;
        }
        if ("Card Replacement".equalsIgnoreCase(apiReason.trim())) {
            return REPLACEMENT_CODES;
        }
        return List.of();
    }

    public static boolean isProductChangeCode(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        if (PRODUCT_CHANGE_CODES.contains(normalized)) {
            return true;
        }
        return normalized.startsWith("PC");
    }

    public static boolean isReplacementCode(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        if (isProductChangeCode(normalized)) {
            return false;
        }
        if (REPLACEMENT_CODES.contains(normalized)) {
            return true;
        }
        return normalized.startsWith("CR") || normalized.startsWith("REPL");
    }

    public static String toDisplayLabel(String code) {
        if (isProductChangeCode(code)) {
            return "Product Change";
        }
        if (isReplacementCode(code)) {
            return "Card Replacement";
        }
        return code != null ? code : "Unknown";
    }
}
