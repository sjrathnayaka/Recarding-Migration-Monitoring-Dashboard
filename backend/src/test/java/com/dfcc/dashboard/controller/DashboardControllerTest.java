package com.dfcc.dashboard.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:ctrldb;MODE=Oracle;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:db/schema.sql",
    "spring.sql.init.data-locations=classpath:db/data.sql",
    "spring.sql.init.continue-on-error=true"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/dashboard/migration-flags"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testInvalidLogin() throws Exception {
        mockMvc.perform(post("/api/login")
                .param("username", "baduser")
                .param("password", "badpass"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.authenticated").value(false))
                .andExpect(jsonPath("$.error").value("Invalid username or password"));
    }

    @Test
    public void testValidLogin() throws Exception {
        mockMvc.perform(post("/api/login")
                .param("username", "operator")
                .param("password", "operator123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("operator"))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"));
    }

    @Test
    @WithMockUser(username = "operator", roles = "OPERATOR")
    public void testOperatorAccessMe() throws Exception {
        mockMvc.perform(get("/api/dashboard/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("operator"))
                .andExpect(jsonPath("$.role").value("ROLE_OPERATOR"));
    }

    @Test
    @WithMockUser(username = "operator", roles = "OPERATOR")
    public void testOperatorAccessEngineStatusForbidden() throws Exception {
        mockMvc.perform(get("/api/dashboard/engine-status"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    public void testAdminAccessEngineStatusAllowed() throws Exception {
        mockMvc.perform(get("/api/dashboard/engine-status"))
                .andExpect(status().isOk());
    }
}
