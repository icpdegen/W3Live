import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Data {
  'id' : bigint,
  'content' : string,
  'owner' : Principal,
  'metadata' : string,
  'createdAt' : Time,
  'updatedAt' : Time,
}
export interface FileMetadata {
  'path' : string,
  'size' : bigint,
  'mimeType' : string,
}
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<HeaderField>,
  'streaming_strategy' : [] | [StreamingStrategy],
  'status_code' : number,
}
export type StreamingCallback = ActorMethod<
  [StreamingToken],
  StreamingCallbackHttpResponse
>;
export interface StreamingCallbackHttpResponse {
  'token' : [] | [StreamingToken],
  'body' : Uint8Array | number[],
}
export type StreamingStrategy = {
    'Callback' : { 'token' : StreamingToken, 'callback' : StreamingCallback }
  };
export interface StreamingToken { 'resource' : string, 'index' : bigint }
export type Time = bigint;
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'createData' : ActorMethod<[string, string], undefined>,
  'delete' : ActorMethod<[string], undefined>,
  'deleteData' : ActorMethod<[bigint], undefined>,
  'getAllData' : ActorMethod<[], Array<Data>>,
  'getCurrentUserRole' : ActorMethod<[], UserRole>,
  'getData' : ActorMethod<[bigint], [] | [Data]>,
  'getUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'health' : ActorMethod<
    [],
    {
      'status' : string,
      'canister_id' : string,
      'timestamp' : Time,
      'memory_usage' : bigint,
    }
  >,
  'httpStreamingCallback' : ActorMethod<
    [StreamingToken],
    StreamingCallbackHttpResponse
  >,
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'initializeAuth' : ActorMethod<[], undefined>,
  'isCurrentUserAdmin' : ActorMethod<[], boolean>,
  'list' : ActorMethod<[], Array<FileMetadata>>,
  'runTests' : ActorMethod<[], string>,
  'saveUserProfile' : ActorMethod<[UserProfile], undefined>,
  'updateData' : ActorMethod<[bigint, string, string], undefined>,
  'upload' : ActorMethod<
    [string, string, Uint8Array | number[], boolean],
    undefined
  >,
  'version' : ActorMethod<[], string>,
}
