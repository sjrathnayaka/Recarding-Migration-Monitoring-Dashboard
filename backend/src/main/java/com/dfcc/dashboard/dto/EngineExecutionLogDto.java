package com.dfcc.dashboard.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EngineExecutionLogDto {
    private String runId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // e.g. "SUCCESS", "FAILED"
    private long cardsProcessed;
    private double avgTimePerCard;
    private long threadCount;
    private long batchSize;
    private long errorCount;
    private String errorMessage;
    private long durationSeconds;
}
