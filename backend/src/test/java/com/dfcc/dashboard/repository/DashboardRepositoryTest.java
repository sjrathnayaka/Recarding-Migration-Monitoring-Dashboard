package com.dfcc.dashboard.repository;

import com.dfcc.dashboard.dto.*;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository integration tests using an in-memory H2 database.
 *
 * IMPORTANT: This test NEVER connects to the real Oracle database.
 * The spring.datasource.* properties here override the main application.yml
 * entirely with an isolated H2 in-memory database that exists only for the
 * lifetime of this test run. The real Oracle tables are untouched.
 *
 * test-schema.sql creates the H2 tables.
 * test-data.sql seeds read-only sample data.
 * No cleanup script is needed — H2 in-memory is destroyed when the JVM exits.
 */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=Oracle;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.sql.init.mode=never"   // We use @Sql below, not auto-init
})
@ActiveProfiles("test")
@Sql(scripts = {
    "/db/test-schema.sql",   // Creates H2 tables
    "/db/test-data.sql"      // Seeds read-only sample data into H2
}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
public class DashboardRepositoryTest {

    @Autowired
    private DashboardRepository dashboardRepository;

    // ─── Migration Flag Tests ───────────────────────────────────────────────

    @Test
    public void testGetMigrationFlags_NoFilters() {
        MigrationFlagsDto dto = dashboardRepository.getMigrationFlags(null, null, null, null, null);
        assertNotNull(dto);
        assertEquals(2, dto.getFlag0()); // cards 1001, 1002
        assertEquals(1, dto.getFlag1()); // card  1003
        assertEquals(1, dto.getFlag2()); // card  1005
        assertEquals(1, dto.getFlag3()); // card  1008
        assertEquals(1, dto.getFlag4()); // card  1011
    }

    @Test
    public void testGetMigrationFlags_WithProductTypeFilter() {
        MigrationFlagsDto dto = dashboardRepository.getMigrationFlags(null, null, "Visa Gold", null, null);
        assertNotNull(dto);
        assertEquals(1, dto.getFlag0()); // card 1001 = Visa Gold
        assertEquals(0, dto.getFlag1());
        assertEquals(1, dto.getFlag2()); // card 1005 = Visa Gold
        assertEquals(0, dto.getFlag3());
        assertEquals(0, dto.getFlag4());
    }

    @Test
    public void testGetMigrationFlags_WithMgrFlagFilter() {
        MigrationFlagsDto dto = dashboardRepository.getMigrationFlags(null, null, null, null, 3);
        assertNotNull(dto);
        assertEquals(0, dto.getFlag0());
        assertEquals(0, dto.getFlag1());
        assertEquals(0, dto.getFlag2());
        assertEquals(1, dto.getFlag3()); // only card 1008
        assertEquals(0, dto.getFlag4());
    }

    @Test
    public void testGetMigrationFlags_WithReasonFilter_JoinsRecard() {
        // Only cards joined to RECARDREQUEST with 'Card Replacement' should appear
        MigrationFlagsDto dto = dashboardRepository.getMigrationFlags(null, null, null, "Card Replacement", null);
        assertNotNull(dto);
        assertEquals(0, dto.getFlag0());
        assertEquals(0, dto.getFlag1());
        assertEquals(1, dto.getFlag2()); // card 1005 via REQ...001
        assertEquals(0, dto.getFlag3());
        assertEquals(1, dto.getFlag4()); // card 1011 via REQ...003
    }

    @Test
    public void testGetMigrationFlags_WithDateRangeFilter() {
        // Only card updated on 2026-06-16 (card 1008, flag=3) should appear
        LocalDateTime from = LocalDateTime.of(2026, 6, 16, 0, 0, 0);
        LocalDateTime to   = LocalDateTime.of(2026, 6, 16, 23, 59, 59);
        MigrationFlagsDto dto = dashboardRepository.getMigrationFlags(from, to, null, null, null);
        assertNotNull(dto);
        assertEquals(0, dto.getFlag0());
        assertEquals(0, dto.getFlag1());
        assertEquals(0, dto.getFlag2());
        assertEquals(1, dto.getFlag3()); // card 1008 updated 2026-06-16
        assertEquals(0, dto.getFlag4());
    }

    // ─── Request Summary Tests ──────────────────────────────────────────────

    @Test
    public void testGetRequestSummary_NoFilters() {
        RequestSummaryDto dto = dashboardRepository.getRequestSummary(null, null, null, null, null);
        assertNotNull(dto);

        // Pending (Flag 2) — card 1005 → Card Replacement
        assertEquals(1, dto.getPending().getReplacement());
        assertEquals(0, dto.getPending().getProductChange());

        // Processed (Flag 3+4) — card 1008 → Product Change, card 1011 → Card Replacement
        assertEquals(1, dto.getProcessed().getReplacement());
        assertEquals(1, dto.getProcessed().getProductChange());

        // Completed (Flag 3) — card 1008 → Product Change
        assertEquals(0, dto.getCompleted().getReplacement());
        assertEquals(1, dto.getCompleted().getProductChange());

        // Failed (Flag 4) — card 1011 → Card Replacement
        assertEquals(1, dto.getFailed().getReplacement());
        assertEquals(0, dto.getFailed().getProductChange());
    }

    // ─── Failed Request Drill-Down Tests ────────────────────────────────────

    @Test
    public void testGetFailedRequests_ReturnsCorrectData() {
        List<FailedRequestDto> list = dashboardRepository.getFailedRequests(null, null, null, null, null);
        assertNotNull(list);
        assertEquals(1, list.size());

        FailedRequestDto failed = list.get(0);
        assertEquals("411111XXXXXX1011", failed.getCardNumber());
        assertEquals("Card Replacement",    failed.getReason());
        assertEquals("Customer KYC mismatch", failed.getRejectRemark());
        assertNotNull(failed.getRequestId());
        assertNotNull(failed.getLastUpdatedTime());
    }

    @Test
    public void testGetFailedRequests_WithNonMatchingMgrFlagFilter() {
        // mgrFlag = 2 (Pending) — should return empty list since failed = flag 4 only
        List<FailedRequestDto> list = dashboardRepository.getFailedRequests(null, null, null, null, 2);
        assertNotNull(list);
        assertTrue(list.isEmpty());
    }

    // ─── Product Types Tests ─────────────────────────────────────────────────

    @Test
    public void testGetProductTypes_ReturnDistinctValues() {
        List<String> list = dashboardRepository.getProductTypes();
        assertNotNull(list);
        assertTrue(list.contains("Visa Gold"));
        assertTrue(list.contains("Visa Platinum"));
        assertTrue(list.contains("Mastercard Gold"));
        assertTrue(list.contains("Mastercard Platinum"));
        // No duplicates
        assertEquals(list.size(), list.stream().distinct().count());
    }

    // ─── Engine Status Tests ──────────────────────────────────────────────────

    @Test
    public void testGetEngineStatus_ReturnsBothEngines() {
        List<EngineStatusDto> list = dashboardRepository.getEngineStatus();
        assertNotNull(list);
        assertEquals(2, list.size());

        EngineStatusDto mse01 = list.stream()
                .filter(s -> "MSE-01".equals(s.getEngineId()))
                .findFirst().orElseThrow(() -> new AssertionError("MSE-01 not found"));
        assertEquals("RUNNING", mse01.getStatus());
        assertEquals(500, mse01.getCardsProcessedPerRun());
        assertEquals(0.85, mse01.getAvgProcessingTime(), 0.001);
        assertEquals(10,  mse01.getThreads());
        assertEquals(500, mse01.getBatchSize());
        assertEquals("10:30-10:45", mse01.getPeriod());
        assertNotNull(mse01.getLastExecution());
        assertNotNull(mse01.getNextExecution());

        EngineStatusDto mse02 = list.stream()
                .filter(s -> "MSE-02".equals(s.getEngineId()))
                .findFirst().orElseThrow(() -> new AssertionError("MSE-02 not found"));
        assertEquals("STOPPED", mse02.getStatus());
        assertEquals(250, mse02.getCardsProcessedPerRun());
        assertEquals(1.12, mse02.getAvgProcessingTime(), 0.001);
    }

    // ─── Engine History / Pagination Tests ───────────────────────────────────

    @Test
    public void testGetEngineHistory_FirstPage() {
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(0, 10, null, null, "startTime", "desc");
        assertNotNull(response);
        assertEquals(22, response.getTotalElements());
        assertEquals(3,  response.getTotalPages());   // ceil(22/10) = 3
        assertEquals(10, response.getContent().size());
        assertEquals(0,  response.getPage());
        assertEquals(10, response.getSize());
    }

    @Test
    public void testGetEngineHistory_SecondPage() {
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(1, 10, null, null, "startTime", "desc");
        assertNotNull(response);
        assertEquals(22, response.getTotalElements());
        assertEquals(10, response.getContent().size());
        assertEquals(1,  response.getPage());
    }

    @Test
    public void testGetEngineHistory_LastPage() {
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(2, 10, null, null, "startTime", "desc");
        assertNotNull(response);
        assertEquals(22, response.getTotalElements());
        assertEquals(2,  response.getContent().size()); // 22 - 20 = 2 remaining rows
        assertEquals(2,  response.getPage());
    }

    @Test
    public void testGetEngineHistory_DateFilter() {
        LocalDateTime from = LocalDateTime.of(2026, 6, 16, 6, 0, 0);
        LocalDateTime to   = LocalDateTime.of(2026, 6, 16, 10, 45, 0);
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(0, 20, from, to, "startTime", "asc");
        assertNotNull(response);
        assertTrue(response.getTotalElements() > 0);
        // Every returned record must be within the date range
        response.getContent().forEach(log -> {
            assertNotNull(log.getStartTime());
            assertFalse(log.getStartTime().isBefore(from),
                "startTime " + log.getStartTime() + " is before from " + from);
            assertFalse(log.getStartTime().isAfter(to),
                "startTime " + log.getStartTime() + " is after to " + to);
        });
    }

    @Test
    public void testGetEngineHistory_DurationComputed() {
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(0, 5, null, null, "startTime", "desc");
        assertNotNull(response);
        response.getContent().stream()
                .filter(log -> log.getEndTime() != null)
                .forEach(log -> assertTrue(log.getDurationSeconds() >= 0,
                        "durationSeconds must be non-negative"));
    }

    @Test
    public void testGetEngineHistory_SortAscending() {
        EngineHistoryResponse response = dashboardRepository.getEngineHistory(0, 22, null, null, "startTime", "asc");
        assertNotNull(response);
        List<LocalDateTime> times = response.getContent().stream()
                .map(log -> log.getStartTime())
                .toList();
        for (int i = 1; i < times.size(); i++) {
            assertFalse(times.get(i).isBefore(times.get(i - 1)),
                    "Records not sorted ascending at index " + i);
        }
    }
}
