import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, type BackendInterface } from '../backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const actorQuery = useQuery<BackendInterface>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            console.log('useActor hook: Creating actor with identity:', identity?.getPrincipal().toString());
            
            const isAuthenticated = !!identity;

            if (!isAuthenticated) {
                console.log('useActor hook: No identity, creating anonymous actor');
                // Return anonymous actor if not authenticated
                return await createActor();
            }

            const actorOptions = {
                agentOptions: {
                    identity
                }
            };

            console.log('useActor hook: Creating authenticated actor');
            const actor = await createActor(actorOptions);
            
            // Try to initialize auth, but don't fail if it doesn't work
            try {
                console.log('useActor hook: Initializing auth');
                await actor.initializeAuth();
                console.log('useActor hook: Auth initialized successfully');
            } catch (error) {
                console.warn('useActor hook: Failed to initialize auth, but continuing:', error);
            }
            
            console.log('useActor hook: Returning actor:', actor);
            return actor;
        },
        // Only refetch when identity changes
        staleTime: Infinity,
        // This will cause the actor to be recreated when the identity changes
        enabled: true,
        // Don't retry on error for local development
        retry: false,
        // Don't fail the query if there are network issues
        retryOnMount: false
    });

    // When the actor changes, invalidate dependent queries
    useEffect(() => {
        if (actorQuery.data) {
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
            queryClient.refetchQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching
    };
}
