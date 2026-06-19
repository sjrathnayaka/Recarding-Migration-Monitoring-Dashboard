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
     * Get the latest update timestamp from the CARD table.
     */
    public Long getLatestUpdateHash() {
        return namedParameterJdbcTemplate.getJdbcOperations().queryForObject(
            "SELECT COUNT(*) + NVL(MAX(CAST(EXTRACT(SECOND FROM (CAST(LASTUPDATEDTIME AS TIMESTAMP))) AS NUMBER)), 0) FROM CARD", 
            Long.class
        );
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
            sql.append("AND rr.REQUESTREASONCODE = :reason ");
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
                case 0: dto.setFlag0(cnt); break;
                case 1: dto.setFlag1(cnt); break;
                case 2: dto.setFlag2(cnt); break;
                case 3: dto.setFlag3(cnt); break;
                case 4: dto.setFlag4(cnt); break;
            }
        });
        return dto;
    }

    /**
     * Fetch request counts split by reason (Card Replacement vs Product Change) for each migration status bucket.
     */
    public RequestSummaryDto getRequestSummary(LocalDateTime fromDate, LocalDateTime toDate, String productType, String reason, Integer mgrFlag) {
        // Counts are driven by CARD.MGRFLAG:
        //   Pending   = MGRFLAG 2
        //   Processed = MGRFLAG 3 or 4
        //   Completed = MGRFLAG 3
        //   Failed    = MGRFLAG 4
        // We LEFT JOIN RECARDREQUEST to optionally split by reason code (CR* vs PC*).
        // Cards with no matching RECARDREQUEST row are still counted (NULL reason = catch-all).
        StringBuilder sql = new StringBuilder(
            "SELECT c.MGRFLAG, rr.REQUESTREASONCODE, COUNT(*) AS cnt " +
            "FROM CARD c " +
            "LEFT JOIN RECARDREQUEST rr ON rr.REQUESTEDCARD = c.CARDNUMBER " +
            "WHERE c.MGRFLAG IN (2, 3, 4) "
        );
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
        if (reason != null && !reason.trim().isEmpty()) {
            sql.append("AND rr.REQUESTREASONCODE = :reason ");
            params.addValue("reason", reason);
        }
        if (mgrFlag != null) {
            sql.append("AND c.MGRFLAG = :mgrFlag ");
            params.addValue("mgrFlag", mgrFlag);
        }

        sql.append("GROUP BY c.MGRFLAG, rr.REQUESTREASONCODE");

        RequestSummaryDto.ReasonBreakdown pending = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown processed = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown completed = new RequestSummaryDto.ReasonBreakdown();
        RequestSummaryDto.ReasonBreakdown failed = new RequestSummaryDto.ReasonBreakdown();

        namedParameterJdbcTemplate.query(sql.toString(), params, rs -> {
            int flag = rs.getInt("MGRFLAG");
            String rsn = rs.getString("REQUESTREASONCODE");
            long cnt = rs.getLong("cnt");

            // Split by reason code where available; NULL reason (no RECARDREQUEST match)
            // is treated as Card Replacement (catch-all) so counts are never lost.
            boolean isProductChange = rsn != null && rsn.toUpperCase().startsWith("PC");
            boolean isReplacement   = !isProductChange; // CR*, NULL, or any other code

            if (flag == 2) {
                if (isReplacement)   pending.setReplacement(pending.getReplacement() + cnt);
                if (isProductChange) pending.setProductChange(pending.getProductChange() + cnt);
            }
            if (flag == 3 || flag == 4) {
                if (isReplacement)   processed.setReplacement(processed.getReplacement() + cnt);
                if (isProductChange) processed.setProductChange(processed.getProductChange() + cnt);
            }
            if (flag == 3) {
                if (isReplacement)   completed.setReplacement(completed.getReplacement() + cnt);
                if (isProductChange) completed.setProductChange(completed.getProductChange() + cnt);
            }
            if (flag == 4) {
                if (isReplacement)   failed.setReplacement(failed.getReplacement() + cnt);
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
        // Always use c.CARDNUMBER as the card identifier so records appear even when
        // no matching RECARDREQUEST row exists (LEFT JOIN may yield NULL rr columns).
        StringBuilder sql = new StringBuilder(
            "SELECT c.CARDNUMBER, rr.REQUESTID, rr.REQUESTREASONCODE, rr.REJECTREMARK, " +
            "COALESCE(rr.LASTUPDATEDTIME, c.LASTUPDATEDTIME) AS LASTUPDATEDTIME " +
            "FROM CARD c " +
            "LEFT JOIN RECARDREQUEST rr ON rr.REQUESTEDCARD = c.CARDNUMBER " +
            "WHERE c.MGRFLAG = 4 "
        );
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
        if (reason != null && !reason.trim().isEmpty()) {
            sql.append("AND rr.REQUESTREASONCODE = :reason ");
            params.addValue("reason", reason);
        }
        if (mgrFlag != null && mgrFlag != 4) {
            // If mgrFlag filter is passed and is not 4, then no failed requests can match.
            return new ArrayList<>();
        }

        sql.append("ORDER BY LASTUPDATEDTIME DESC");

        return namedParameterJdbcTemplate.query(sql.toString(), params, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("LASTUPDATEDTIME");
            LocalDateTime lastUpdated = ts != null ? ts.toLocalDateTime() : null;
            return FailedRequestDto.builder()
                    .requestId(rs.getString("REQUESTID"))           // may be null if no RECARDREQUEST
                    .cardNumber(rs.getString("CARDNUMBER"))          // always from CARD table
                    .reason(rs.getString("REQUESTREASONCODE"))       // may be null
                    .rejectRemark(rs.getString("REJECTREMARK"))      // may be null
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
     * Fetch list of distinct product types.
     */
    public List<String> getProductTypes() {
        String sql = "SELECT DISTINCT CARDPRODUCT FROM CARD WHERE CARDPRODUCT IS NOT NULL ORDER BY CARDPRODUCT";
        return namedParameterJdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("CARDPRODUCT"));
    }
}
