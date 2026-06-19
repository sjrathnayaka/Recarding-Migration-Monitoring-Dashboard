package com.dfcc.dashboard.service;

import com.dfcc.dashboard.repository.DashboardRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class DashboardNotificationService {

    private final DashboardRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicLong lastHash = new AtomicLong(-1);

    public DashboardNotificationService(DashboardRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Polls the database every 5 seconds to check for changes.
     * If a change is detected, it sends a message via WebSocket.
     */
    @Scheduled(fixedRate = 5000)
    public void checkForUpdates() {
        try {
            Long currentHash = repository.getLatestUpdateHash();
            if (currentHash != null && currentHash != lastHash.get()) {
                if (lastHash.get() != -1) {
                    // Send notification to clients
                    messagingTemplate.convertAndSend("/topic/dashboard-updates", "DATA_CHANGED");
                }
                lastHash.set(currentHash);
            }
        } catch (Exception e) {
            // Log error or handle gracefully
            System.err.println("Error checking for DB updates: " + e.getMessage());
        }
    }
}
