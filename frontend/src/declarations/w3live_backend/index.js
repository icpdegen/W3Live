import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
import { idlFactory } from "./w3live_backend.did.js";
export { idlFactory } from "./w3live_backend.did.js";

/* CANISTER_ID - mainnet backend */
export const canisterId = "7m67m-xiaaa-aaaam-qd2tq-cai";

export const createActor = (canisterId, options = {}) => {
  // Use mainnet host
  const host = "https://ic0.app";
  
  const agent = options.agent || new HttpAgent({ 
    host,
    ...options.agentOptions 
  });

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for mainnet
  agent.fetchRootKey().catch((err) => {
    console.warn(
      "Unable to fetch root key. Check to ensure that your local replica is running"
    );
    console.error(err);
  });

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

export const w3live_backend = createActor(canisterId);
