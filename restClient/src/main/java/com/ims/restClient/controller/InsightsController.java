package com.ims.restClient.controller;

import com.ims.restClient.dto.response.InsightsSummaryResponse;
import com.ims.restClient.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/summary")
    public ResponseEntity<InsightsSummaryResponse> getSummary() {
        return ResponseEntity.ok(insightsService.getSummary());
    }
}