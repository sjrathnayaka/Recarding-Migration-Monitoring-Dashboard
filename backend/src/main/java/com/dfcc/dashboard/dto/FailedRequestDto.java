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
public class FailedRequestDto {
    private String requestId;
    private String cardNumber;
    private String reason;
    private String rejectRemark;
    private LocalDateTime lastUpdatedTime;
}
