import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_DFX_NETWORK: 'local',
    VITE_CANISTER_ID_W3LIVE_BACKEND: 'test-canister-id',
    VITE_PERSPECTIVE_API_KEY: 'test-api-key',
  },
  writable: true,
});

// Setup MSW for API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock ICP agent for testing
export const mockAgent = {
  fetchRootKey: vi.fn().mockResolvedValue(undefined),
  call: vi.fn(),
  query: vi.fn(),
  readState: vi.fn(),
};

// Mock Actor creation
vi.mock('@dfinity/agent', () => ({
  Actor: {
    createActor: vi.fn().mockReturnValue({
      initializeAuth: vi.fn().mockResolvedValue(undefined),
      getCurrentUserRole: vi.fn().mockResolvedValue({ user: null }),
      isCurrentUserAdmin: vi.fn().mockResolvedValue(false),
      getUserProfile: vi.fn().mockResolvedValue(null),
      saveUserProfile: vi.fn().mockResolvedValue(undefined),
      createData: vi.fn().mockResolvedValue(undefined),
      updateData: vi.fn().mockResolvedValue(undefined),
      deleteData: vi.fn().mockResolvedValue(undefined),
      getData: vi.fn().mockResolvedValue(null),
      getAllData: vi.fn().mockResolvedValue([]),
      list: vi.fn().mockResolvedValue([]),
      upload: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    }),
  },
  HttpAgent: vi.fn().mockImplementation(() => mockAgent),
}));

// Mock AuthClient
vi.mock('@dfinity/auth-client', () => ({
  AuthClient: {
    create: vi.fn().mockResolvedValue({
      isAuthenticated: vi.fn().mockResolvedValue(false),
      getIdentity: vi.fn().mockReturnValue({
        getPrincipal: vi.fn().mockReturnValue({
          toString: vi.fn().mockReturnValue('test-principal'),
        }),
      }),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock Internet Identity
vi.mock('ic-use-internet-identity', () => ({
  useInternetIdentity: vi.fn().mockReturnValue({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    identity: null,
    principal: null,
  }),
}));

// Global test utilities
export const createMockEvent = (data: any) => ({
  id: Date.now(),
  title: 'Test Event',
  description: 'Test Description',
  organizer: 'test-organizer',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 3600000).toISOString(),
  isLive: false,
  streamUrl: '',
  thumbnailUrl: '',
  tags: ['test'],
  ...data,
});

export const createMockComment = (data: any) => ({
  id: Date.now(),
  eventId: 1,
  author: 'test-user',
  content: 'Test comment',
  timestamp: new Date().toISOString(),
  isModerated: false,
  ...data,
});

export const createMockFileMetadata = (data: any) => ({
  path: '/test/file.txt',
  mimeType: 'text/plain',
  size: 1024,
  uploadedAt: new Date().toISOString(),
  ...data,
});