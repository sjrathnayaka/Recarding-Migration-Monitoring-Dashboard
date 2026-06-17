package com.dfcc.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MigrationFlagsDto {
    private long flag0;
    private long flag1;
    private long flag2;
    private long flag3;
    private long flag4;
}
