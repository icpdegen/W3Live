import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock handlers for external APIs
export const handlers = [
  // Mock Perspective API for comment moderation
  http.post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze', () => {
    return HttpResponse.json({
      attributeScores: {
        TOXICITY: {
          summaryScore: {
            value: 0.1, // Low toxicity score
          },
        },
      },
    });
  }),

  // Mock ICP boundary node responses
  http.post('https://ic0.app/api/v2/canister/*/call', () => {
    return HttpResponse.json({
      status: 'replied',
      reply: { arg: new Uint8Array([]) },
    });
  }),

  // Mock local replica responses
  http.post('http://127.0.0.1:8000/api/v2/canister/*/call', () => {
    return HttpResponse.json({
      status: 'replied',
      reply: { arg: new Uint8Array([]) },
    });
  }),

  // Mock file upload endpoints
  http.post('/api/upload', () => {
    return HttpResponse.json({
      success: true,
      path: '/uploads/test-file.jpg',
    });
  }),

  // Mock streaming endpoints
  http.get('/stream/*', () => {
    return new HttpResponse('Mock stream data', {
      headers: {
        'Content-Type': 'video/mp4',
      },
    });
  }),
];

// Setup mock server
export const server = setupServer(...handlers);