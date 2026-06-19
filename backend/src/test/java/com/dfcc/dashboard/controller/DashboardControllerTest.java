package com.dfcc.dashboard.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:ctrldb;MODE=Oracle;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.sql.init.mode=never"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.test.context.jdbc.Sql(scripts = {
    "/db/test-schema.sql",
    "/db/test-data.sql"
})
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testPublicAccessMigrationFlags() throws Exception {
        mockMvc.perform(get("/api/dashboard/migration-flags"))
                .andExpect(status().isOk());
    }

    @Test
    public void testPublicAccessEngineStatus() throws Exception {
        mockMvc.perform(get("/api/dashboard/engine-status"))
                .andExpect(status().isOk());
    }
}
