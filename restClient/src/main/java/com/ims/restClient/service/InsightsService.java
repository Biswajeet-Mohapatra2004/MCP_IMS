package com.ims.restClient.service;

import com.ims.restClient.dto.response.InsightsSummaryResponse;
import com.ims.restClient.dto.response.ReorderCandidate;

import java.util.List;

public interface InsightsService {
    InsightsSummaryResponse getSummary();
    List<ReorderCandidate> getReorderCandidates();
}