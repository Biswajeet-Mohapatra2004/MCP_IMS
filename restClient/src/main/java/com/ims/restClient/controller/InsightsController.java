package com.ims.restClient.controller;

import com.ims.restClient.dto.response.InsightsSummaryResponse;
import com.ims.restClient.dto.response.ReorderCandidate;
import com.ims.restClient.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/summary")
    public ResponseEntity<InsightsSummaryResponse> getSummary() {
        return ResponseEntity.ok(insightsService.getSummary());
    }

    @GetMapping("/reorder-candidates")
    public ResponseEntity<List<ReorderCandidate>> getReorderCandidates() {
        return ResponseEntity.ok(insightsService.getReorderCandidates());
    }
}