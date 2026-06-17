package com.dfcc.dashboard.controller;

import com.dfcc.dashboard.dto.*;
import com.dfcc.dashboard.repository.DashboardRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardRepository dashboardRepository;

    public DashboardController(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    /**
     * GET /api/dashboard/migration-flags
     */
    @GetMapping("/migration-flags")
    public MigrationFlagsDto getMigrationFlags(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Integer mgrFlag) {
        return dashboardRepository.getMigrationFlags(fromDate, toDate, productType, reason, mgrFlag);
    }

    /**
     * GET /api/dashboard/request-summary
     */
    @GetMapping("/request-summary")
    public RequestSummaryDto getRequestSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Integer mgrFlag) {
        return dashboardRepository.getRequestSummary(fromDate, toDate, productType, reason, mgrFlag);
    }

    /**
     * GET /api/dashboard/failed-requests
     */
    @GetMapping("/failed-requests")
    public List<FailedRequestDto> getFailedRequests(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) Integer mgrFlag) {
        return dashboardRepository.getFailedRequests(fromDate, toDate, productType, reason, mgrFlag);
    }

    /**
     * GET /api/dashboard/engine-status
     * Access restricted to ADMIN only.
     */
    @GetMapping("/engine-status")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EngineStatusDto> getEngineStatus() {
        return dashboardRepository.getEngineStatus();
    }

    /**
     * GET /api/dashboard/engine-history
     * Access restricted to ADMIN only.
     */
    @GetMapping("/engine-history")
    @PreAuthorize("hasRole('ADMIN')")
    public EngineHistoryResponse getEngineHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return dashboardRepository.getEngineHistory(page, size, fromDate, toDate, sortBy, sortDir);
    }

    /**
     * GET /api/dashboard/product-types
     */
    @GetMapping("/product-types")
    public List<String> getProductTypes() {
        return dashboardRepository.getProductTypes();
    }
}
