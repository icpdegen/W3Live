import { Actor, HttpAgent, type ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { createActor as createBackendActor, canisterId as backendCanisterId } from './declarations/w3live_backend';

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

// Backend interface - use the generated one
export type BackendInterface = any;

// Canister ID - use the generated one
export const canisterId = backendCanisterId;

// Create the actor
export async function createActor(options?: { agentOptions?: { identity?: any } }): Promise<ActorSubclass<any>> {
  try {
    console.log('Creating actor with options:', options);
    
    let identity;
    
    if (options?.agentOptions?.identity) {
      // Use the provided identity (from Internet Identity)
      identity = options.agentOptions.identity;
      console.log('Using provided identity:', identity.getPrincipal().toString());
    } else {
      // Fallback to anonymous identity
      const authClient = await AuthClient.create();
      identity = authClient.getIdentity();
      console.log('Using anonymous identity:', identity.getPrincipal().toString());
    }

    console.log('Creating backend actor with canister ID:', backendCanisterId);
    
    const actor = createBackendActor(backendCanisterId, {
      agentOptions: {
        identity,
        host: 'https://ic0.app',
      },
    });
    
    console.log('Actor created successfully:', actor);
    return actor;
  } catch (error) {
    console.error('Error creating actor:', error);
    throw error;
  }
} 
