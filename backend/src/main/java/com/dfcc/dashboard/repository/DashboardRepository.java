package com.dfcc.dashboard.repository;

import com.dfcc.dashboard.dto.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    public DashboardRepository(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
    }

    /**
     * Fetch card counts grouped by migration flag (MGRFLAG).
     */
    public MigrationFlagsDto getMigrationFlags(LocalDateTime fromDate, LocalDateTime toDate, String productType, String reason, Integer mgrFlag) {
        boolean joinReason = reason != null && !reason.trim().isEmpty();
        StringBuilder sql = new StringBuilder("SELECT c.MGRFLAG, COUNT(*) AS cnt FROM CARD c ");
        if (joinReason) {
            sql.append("LEFT JOIN RECARDREQUEST rr ON rr.REQUESTEDCARD = c.CARDNUMBER ");
        }
        sql.append("WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (fromDate != null) {
            sql.append("AND c.LASTUPDATEDTIME >= :fromDate ");
            params.addValue("fromDate", Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            sql.append("AND c.LASTUPDATEDTIME <= :toDate ");
            params.addValue("toDate", Timestamp.valueOf(toDate));
        }
        if (productType != null && !productType.trim().isEmpty()) {
            sql.append("AND c.CARDPRODUCT = :productType ");
            params.addValue("productType", productType);
        }
        if (joinReason) {
            sql.append("AND rr.REASON = :reason ");
            params.addValue("reason", reason);
        }
        if (mgrFlag != null) {
            sql.append("AND c.MGRFLAG = :mgrFlag ");
            params.addValue("mgrFlag", mgrFlag);
        }

        sql.append("GROUP BY c.MGRFLAG");

        MigrationFlagsDto dto = new MigrationFlagsDto();
        namedParameterJdbcTemplate.query(sql.toString(), params, rs -> {
            int flag = rs.getInt("MGRFLAG");
            long cnt = rs.getLong("cnt");
            switch (flag) {
                case 0 -> dto.setFlag0(cnt);
                case 1 -> dto.setFlag1(cnt);
                case 2 -> dto.setFlag2(cnt);
                case 3 -> dto.setFlag3(cnt);
                case 4 -> dto.setFlag4(cnt);
            }
        });
        return dto;
    }

    /**
     * Fetch request counts split by reason (Card Replacement vs Product Change) for each migration status bucket.
     */
    public RequestSummaryDto getRequestSummary(LocalDateTime fromDate, LocalDateTime toDate, String productType, String reason, Integer mgrFlag) {
        StringBuilder sql = new StringBuilder(
            "SELECT c.MGRFLAG, rr.REASON, COUNT(*) AS cnt " +
            "FROM CARD c " +
            "JOIN RECARDREQUEST rr ON rr.REQUESTEDCARD = c.CARDNUMBER " +
            "WHERE 1=1 "
        );
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (fromDate != null) {
            sql.append("AND rr.LASTUPDATEDTIME >= :fromDate ");
            params.addValue("fromDate", Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            sql.append("AND rr.LASTUPDATEDTIME <= :toDate ");
            params.addValue("toDate", Timestamp.valueOf(toDate));
        }
        if (productType != null && !productType.trim().isEmpty()) {
            sql.append("AND c.CARDPRODUCT = :productType ");
            params.addValue("productType", productType);
        }
        if (reason != null && !reason.trim().isEmpty()) {
            sql.append("AND rr.REASON = :reason ");
            params.addValue("reason", reason);
        }
        if (mgrFlag != null) {
            sql.append("AND c.MGRFLAG = :mgrFlag ");
            params.addValue("mgrFlag", mgrFlag);
        }

        sql.append("GROUP BY c.MGRFLAG, rr.REASON");

        RequestSummaryDto.ReasonBreakdown pending = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown processed = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown completed = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown failed = new RequestSummaryDto.ReasonBreakdown();

        namedParameterJdbcTemplate.query(sql.toString(), params, rs -> {
            int flag = rs.getInt("MGRFLAG");
            String rsn = rs.getString("REASON");
            long cnt = rs.getLong("cnt");

            boolean isReplacement = rsn != null && rsn.equalsIgnoreCase("Card Replacement");
            boolean isProductChange = rsn != null && rsn.equalsIgnoreCase("Product Change");

            if (flag == 2) {
                if (isReplacement) pending.setReplacement(pending.getReplacement() + cnt);
                if (isProductChange) pending.setProductChange(pending.getProductChange() + cnt);
            }
            if (flag == 3 || flag == 4) {
                if (isReplacement) processed.setReplacement(processed.getReplacement() + cnt);
                if (isProductChange) processed.setProductChange(processed.getProductChange() + cnt);
            }
            if (flag == 3) {
                if (isReplacement) completed.setReplacement(completed.getReplacement() + cnt);
                if (isProductChange) completed.setProductChange(completed.getProductChange() + cnt);
            }
            if (flag == 4) {
                if (isReplacement) failed.setReplacement(failed.getReplacement() + cnt);
                if (isProductChange) failed.setProductChange(failed.getProductChange() + cnt);
            }
        });

        return RequestSummaryDto.builder()
                .pending(pending)
                .processed(processed)
                .completed(completed)
                .failed(failed)
                .build();
    }

    /**
     * Fetch list of failed requests (MGRFLAG = 4) for the detail drill-down.
     */
    public List<FailedRequestDto> getFailedRequests(LocalDateTime fromDate, LocalDateTime toDate, String productType, String reason, Integer mgrFlag) {
        StringBuilder sql = new StringBuilder(
            "SELECT rr.REQUESTID, rr.REQUESTEDCARD, rr.REASON, rr.REJECTREMARK, rr.LASTUPDATEDTIME " +
            "FROM CARD c " +
            "JOIN RECARDREQUEST rr ON rr.REQUESTEDCARD = c.CARDNUMBER " +
            "WHERE c.MGRFLAG = 4 "
        );
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (fromDate != null) {
            sql.append("AND rr.LASTUPDATEDTIME >= :fromDate ");
            params.addValue("fromDate", Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            sql.append("AND rr.LASTUPDATEDTIME <= :toDate ");
            params.addValue("toDate", Timestamp.valueOf(toDate));
        }
        if (productType != null && !productType.trim().isEmpty()) {
            sql.append("AND c.CARDPRODUCT = :productType ");
            params.addValue("productType", productType);
        }
        if (reason != null && !reason.trim().isEmpty()) {
            sql.append("AND rr.REASON = :reason ");
            params.addValue("reason", reason);
        }
        if (mgrFlag != null && mgrFlag != 4) {
            // If mgrFlag filter is passed and is not 4, then no failed requests can match.
            return new ArrayList<>();
        }

        sql.append("ORDER BY rr.LASTUPDATEDTIME DESC");

        return namedParameterJdbcTemplate.query(sql.toString(), params, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("LASTUPDATEDTIME");
            LocalDateTime lastUpdated = ts != null ? ts.toLocalDateTime() : null;
            return FailedRequestDto.builder()
                    .requestId(rs.getString("REQUESTID"))
                    .cardNumber(rs.getString("REQUESTEDCARD"))
                    .reason(rs.getString("REASON"))
                    .rejectRemark(rs.getString("REJECTREMARK"))
                    .lastUpdatedTime(lastUpdated)
                    .build();
        });
    }

    /**
     * Fetch active engine status telemetry.
     */
    public List<EngineStatusDto> getEngineStatus() {
        String sql = "SELECT ENGINEID, ENGINESTATUS, LASTEXECUTIONTIME, NEXTSCHEDULEDRUNTIME, " +
                     "CARDSPROCESSEDPERRUN, AVGPROCESSINGTIMEPERCARD, THREADSRUNPARALLEL, BATCHSIZE, PERIOD " +
                     "FROM MD_ENGINE_CONFIGURATIONS ORDER BY ENGINEID";

        return namedParameterJdbcTemplate.query(sql, (rs, rowNum) -> {
            int statusNum = rs.getInt("ENGINESTATUS");
            String status = statusNum == 1 ? "RUNNING" : "STOPPED";

            Timestamp let = rs.getTimestamp("LASTEXECUTIONTIME");
            LocalDateTime lastExecution = let != null ? let.toLocalDateTime() : null;

            Timestamp nst = rs.getTimestamp("NEXTSCHEDULEDRUNTIME");
            LocalDateTime nextExecution = nst != null ? nst.toLocalDateTime() : null;

            return EngineStatusDto.builder()
                    .engineId(rs.getString("ENGINEID"))
                    .status(status)
                    .lastExecution(lastExecution)
                    .nextExecution(nextExecution)
                    .cardsProcessedPerRun(rs.getLong("CARDSPROCESSEDPERRUN"))
                    .avgProcessingTime(rs.getDouble("AVGPROCESSINGTIMEPERCARD"))
                    .threads(rs.getLong("THREADSRUNPARALLEL"))
                    .batchSize(rs.getLong("BATCHSIZE"))
                    .period(rs.getString("PERIOD"))
                    .build();
        });
    }

    /**
     * Fetch paginated execution logs.
     */
    public EngineHistoryResponse getEngineHistory(int page, int size, LocalDateTime fromDate, LocalDateTime toDate, String sortBy, String sortDir) {
        StringBuilder countSql = new StringBuilder(
            "SELECT COUNT(*) FROM MD_ENGINE_EXECUTION_LOG WHERE 1=1 "
        );
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (fromDate != null) {
            countSql.append("AND STARTTIME >= :fromDate ");
            params.addValue("fromDate", Timestamp.valueOf(fromDate));
        }
        if (toDate != null) {
            countSql.append("AND STARTTIME <= :toDate ");
            params.addValue("toDate", Timestamp.valueOf(toDate));
        }

        Long totalElementsObj = namedParameterJdbcTemplate.queryForObject(countSql.toString(), params, Long.class);
        long totalElements = totalElementsObj != null ? totalElementsObj : 0;
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // Sorting field configuration
        String sortCol = "STARTTIME"; // Default sort
        if (sortBy != null) {
            switch (sortBy) {
                case "runId" -> sortCol = "RUNID";
                case "startTime" -> sortCol = "STARTTIME";
                case "endTime" -> sortCol = "ENDTIME";
                case "status" -> sortCol = "STATUS";
                case "cardsProcessed" -> sortCol = "CARDSPROCESSED";
                case "avgTimePerCard" -> sortCol = "AVGTIMEPERCARD";
                case "threadCount" -> sortCol = "THREADCOUNT";
                case "batchSize" -> sortCol = "BATCHSIZE";
                case "errorCount" -> sortCol = "ERRORCOUNT";
                case "durationSeconds" -> sortCol = "(ENDTIME - STARTTIME)";
            }
        }

        // Sorting direction configuration
        String direction = "DESC";
        if (sortDir != null && (sortDir.equalsIgnoreCase("ASC") || sortDir.equalsIgnoreCase("DESC"))) {
            direction = sortDir.toUpperCase();
        }

        StringBuilder sql = new StringBuilder(
            "SELECT RUNID, STARTTIME, ENDTIME, STATUS, CARDSPROCESSED, AVGTIMEPERCARD, THREADCOUNT, BATCHSIZE, ERRORCOUNT, ERRORMESSAGE " +
            "FROM MD_ENGINE_EXECUTION_LOG " +
            "WHERE 1=1 "
        );

        if (fromDate != null) {
            sql.append("AND STARTTIME >= :fromDate ");
        }
        if (toDate != null) {
            sql.append("AND STARTTIME <= :toDate ");
        }

        sql.append("ORDER BY ").append(sortCol).append(" ").append(direction).append(" ");
        sql.append("OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY");

        params.addValue("offset", page * size);
        params.addValue("size", size);

        List<EngineExecutionLogDto> logs = namedParameterJdbcTemplate.query(sql.toString(), params, (rs, rowNum) -> {
            Timestamp st = rs.getTimestamp("STARTTIME");
            LocalDateTime startTime = st != null ? st.toLocalDateTime() : null;

            Timestamp et = rs.getTimestamp("ENDTIME");
            LocalDateTime endTime = et != null ? et.toLocalDateTime() : null;

            long durationSeconds = 0;
            if (st != null && et != null) {
                durationSeconds = (et.getTime() - st.getTime()) / 1000;
            }

            return EngineExecutionLogDto.builder()
                    .runId(rs.getString("RUNID"))
                    .startTime(startTime)
                    .endTime(endTime)
                    .status(rs.getString("STATUS"))
                    .cardsProcessed(rs.getLong("CARDSPROCESSED"))
                    .avgTimePerCard(rs.getDouble("AVGTIMEPERCARD"))
                    .threadCount(rs.getLong("THREADCOUNT"))
                    .batchSize(rs.getLong("BATCHSIZE"))
                    .errorCount(rs.getLong("ERRORCOUNT"))
                    .errorMessage(rs.getString("ERRORMESSAGE"))
                    .durationSeconds(durationSeconds)
                    .build();
        });

        return EngineHistoryResponse.builder()
                .content(logs)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .page(page)
                .size(size)
                .build();
    }

    /**
     * Fetch list of distinct product types.
     */
    public List<String> getProductTypes() {
        String sql = "SELECT DISTINCT CARDPRODUCT FROM CARD WHERE CARDPRODUCT IS NOT NULL ORDER BY CARDPRODUCT";
        return namedParameterJdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("CARDPRODUCT"));
    }
}
