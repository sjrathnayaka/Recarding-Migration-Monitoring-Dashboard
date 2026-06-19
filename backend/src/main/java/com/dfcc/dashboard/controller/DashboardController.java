package com.dfcc.dashboard.controller;

import com.dfcc.dashboard.dto.*;
import com.dfcc.dashboard.repository.DashboardRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
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
    @GetMapping("/test-columns")
    public List<String> testColumns() {
        return dashboardRepository.getTableColumns();
    }

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
     */
    @GetMapping("/engine-status")
    public List<EngineStatusDto> getEngineStatus() {
        return dashboardRepository.getEngineStatus();
    }

    /**
     * GET /api/dashboard/product-types
     */
    @GetMapping("/product-types")
    public List<String> getProductTypes() {
        return dashboardRepository.getProductTypes();
    }
}
