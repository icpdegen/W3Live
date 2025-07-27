import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Backend types that match your Motoko canister
export interface UserProfile {
  name: string;
}

export interface Data {
  id: bigint;
  content: string;
  metadata: string;
  owner: Principal;
  createdAt: bigint;
  updatedAt: bigint;
}

// Backend interface that matches your Motoko canister methods
export interface BackendInterface {
  initializeAuth: () => Promise<void>;
  getCurrentUserRole: () => Promise<any>;
  isCurrentUserAdmin: () => Promise<boolean>;
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  createData: (content: string, metadata: string) => Promise<void>;
  updateData: (id: bigint, content: string, metadata: string) => Promise<void>;
  deleteData: (id: bigint) => Promise<void>;
  getData: (id: bigint) => Promise<Data | null>;
  getAllData: () => Promise<Data[]>;
  list: () => Promise<any[]>;
  upload: (path: string, mimeType: string, chunk: Uint8Array, complete: boolean) => Promise<void>;
  delete: (path: string) => Promise<void>;
  http_request: (request: any) => Promise<any>;
  httpStreamingCallback: (token: any) => Promise<any>;
}

// Canister ID - this will be set after deployment
const CANISTER_ID = (import.meta as any).env?.VITE_CANISTER_ID_W3LIVE_BACKEND || '';

// Create the actor
export async function createActor(): Promise<Actor<BackendInterface>> {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  
  const agent = new HttpAgent({
    identity,
    host: (import.meta as any).env?.VITE_DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://127.0.0.1:8000',
  });

  // For local development, we need to fetch the root key
  if ((import.meta as any).env?.VITE_DFX_NETWORK !== 'ic') {
    await agent.fetchRootKey();
  }

  return Actor.createActor<BackendInterface>({
    canisterId: CANISTER_ID,
    agent,
  });
} 