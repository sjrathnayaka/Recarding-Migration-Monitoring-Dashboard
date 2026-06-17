package com.dfcc.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestSummaryDto {
    private ReasonBreakdown pending;
    private ReasonBreakdown processed;
    private ReasonBreakdown completed;
    private ReasonBreakdown failed;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReasonBreakdown {
        private long replacement;
        private long productChange;
    }
}
