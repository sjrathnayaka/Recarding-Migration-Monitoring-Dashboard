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

    private volatile boolean pendingRetry = false;
    private volatile long retryAfter     = 0;

    public DashboardNotificationService(DashboardRepository repository, SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Polls the database every 5 seconds to check for changes.
     * If a change is detected, it broadcasts "DATA_CHANGED" via WebSocket.
     * If the broadcast fails, it retries once after a 10-second cooldown.
     * During the cooldown window normal DB polling is paused.
     */
    @Scheduled(fixedRate = 5000)
    public void checkForUpdates() {

        // ── Retry path ───────────────────────────────────────────────────────
        if (pendingRetry) {
            if (System.currentTimeMillis() >= retryAfter) {
                try {
                    messagingTemplate.convertAndSend("/topic/dashboard-updates", "DATA_CHANGED");
                    pendingRetry = false;           // retry succeeded – resume normal polling
                } catch (Exception e) {
                    retryAfter = System.currentTimeMillis() + 10_000; // push back another 10 s
                }
            }
            return; // skip DB poll while a retry is pending
        }

        // ── Normal path ───────────────────────────────────────────────────────
        try {
            Long currentHash = repository.getLatestUpdateHash();
            if (currentHash != null && currentHash != lastHash.get()) {
                if (lastHash.get() != -1) {
                    try {
                        messagingTemplate.convertAndSend("/topic/dashboard-updates", "DATA_CHANGED");
                    } catch (Exception e) {
                        // Broadcast failed – schedule a retry in 10 seconds
                        pendingRetry = true;
                        retryAfter   = System.currentTimeMillis() + 10_000;
                    }
                }
                lastHash.set(currentHash); // hash moves forward regardless of send outcome
            }
        } catch (Exception e) {
            // DB query failed – skip this tick, will try again in 5 seconds
        }
    }
}

