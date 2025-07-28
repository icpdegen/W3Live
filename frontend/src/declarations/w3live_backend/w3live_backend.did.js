export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Data = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'owner' : IDL.Principal,
    'metadata' : IDL.Text,
    'createdAt' : Time,
    'updatedAt' : Time,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const StreamingToken = IDL.Record({
    'resource' : IDL.Text,
    'index' : IDL.Nat,
  });
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : IDL.Opt(StreamingToken),
    'body' : IDL.Vec(IDL.Nat8),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const StreamingCallback = IDL.Func(
      [StreamingToken],
      [StreamingCallbackHttpResponse],
      ['query'],
    );
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : StreamingToken,
      'callback' : StreamingCallback,
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const FileMetadata = IDL.Record({
    'path' : IDL.Text,
    'size' : IDL.Nat,
    'mimeType' : IDL.Text,
  });
  return IDL.Service({
    'createData' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'delete' : IDL.Func([IDL.Text], [], []),
    'deleteData' : IDL.Func([IDL.Nat], [], []),
    'getAllData' : IDL.Func([], [IDL.Vec(Data)], ['query']),
    'getCurrentUserRole' : IDL.Func([], [UserRole], ['query']),
    'getData' : IDL.Func([IDL.Nat], [IDL.Opt(Data)], ['query']),
    'getUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'health' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'canister_id' : IDL.Text,
            'timestamp' : Time,
            'memory_usage' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'httpStreamingCallback' : IDL.Func(
        [StreamingToken],
        [StreamingCallbackHttpResponse],
        ['query'],
      ),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'initializeAuth' : IDL.Func([], [], []),
    'isCurrentUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'list' : IDL.Func([], [IDL.Vec(FileMetadata)], []),
    'runTests' : IDL.Func([], [IDL.Text], []),
    'saveUserProfile' : IDL.Func([UserProfile], [], []),
    'updateData' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [], []),
    'upload' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Bool],
        [],
        [],
      ),
    'version' : IDL.Func([], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
