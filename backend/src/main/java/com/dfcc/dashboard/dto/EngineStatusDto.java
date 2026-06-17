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
public class EngineStatusDto {
    private String engineId;
    private String status; // "RUNNING" or "STOPPED"
    private LocalDateTime lastExecution;
    private LocalDateTime nextExecution;
    private long cardsProcessedPerRun;
    private double avgProcessingTime; // represented in seconds, e.g. 0.85
    private long threads;
    private long batchSize;
    private String period;
}
