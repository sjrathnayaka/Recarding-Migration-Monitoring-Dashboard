package com.dfcc.dashboard.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    /**
     * GET /api/health
     * Performs a lightweight read-only DB ping (SELECT 1 FROM DUAL).
     * Does NOT modify any records, tables, or DB objects.
     */
    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("service", "recarding-dashboard-backend");
        result.put("timestamp", LocalDateTime.now().toString());

        try {
            // Oracle ping — read-only, no data modification
            Integer ping = jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
            result.put("database", "UP");
            result.put("dbPing", ping);
            result.put("status", "OK");
        } catch (Exception e) {
            result.put("database", "DOWN");
            result.put("dbError", e.getMessage());
            result.put("status", "ERROR");
        }

        return result;
    }
}
