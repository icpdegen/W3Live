import Http "http";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

module {
    type Asset = {
        mimeType : Text;
        chunks : [Blob];
    };

    public type FileStorage = {
        var assets : HashMap.HashMap<Text, Asset>;
        var pending : HashMap.HashMap<Text, Asset>;
    };

    public func new() : FileStorage {
        {
            var assets = HashMap.HashMap<Text, Asset>(0, Text.equal, Text.hash);
            var pending = HashMap.HashMap<Text, Asset>(0, Text.equal, Text.hash);
        };
    };

    public type FileMetadata = {
        path : Text;
        mimeType : Text;
        size : Nat;
    };

    public func list(storage : FileStorage) : [FileMetadata] {
        let entries = storage.assets.entries();
        Iter.toArray(
            Iter.map<(Text, Asset), FileMetadata>(
                entries,
                func((path, asset)) {
                    let size = Array.foldLeft<Blob, Nat>(asset.chunks, 0, func(sum, chunk) { sum + chunk.size() });
                    let mimeType = asset.mimeType;
                    { path; mimeType; size };
                }
            )
        );
    };

    public func upload(storage : FileStorage, path : Text, mimeType : Text, chunk : Blob, complete : Bool) {
        let chunks = switch (storage.pending.get(path)) {
            case null [chunk];
            case (?old) Array.append(old.chunks, [chunk]);
        };
        let combined = { mimeType; chunks };
        if (complete) {
            ignore storage.pending.remove(path);
            ignore storage.assets.put(path, combined);
        } else {
            ignore storage.pending.put(path, combined);
        };
    };

    public func delete(storage : FileStorage, path : Text) {
        ignore storage.assets.remove(path);
        ignore storage.pending.remove(path);
    };

    let skipCertificate = ("IC-Certificate", "skip");

    let notFound : Http.HttpResponse = {
        status_code = 404;
        headers = [
            ("Content-Type", "text/html"),
            skipCertificate
        ];
        body = "<h1>404 - Not Found</h1>";
        streaming_strategy = null;
    };

    public func fileRequest(storage : FileStorage, request : Http.HttpRequest, callback : Http.StreamingCallback) : Http.HttpResponse {
        let path = switch (Text.stripStart(request.url, #char('/'))) {
            case null request.url;
            case (?stripped) stripped;
        };
        switch (storage.assets.get(path)) {
            case null notFound;
            case (?asset) {
                let streamingStrategy = if (asset.chunks.size() == 1) {
                    null;
                } else {
                    let token = {
                        resource = path;
                        index = 1;
                    };
                    ?(#Callback({ callback; token }));
                };
                let firstChunk = asset.chunks[0];
                return {
                    status_code = 200;
                    headers = [
                        ("Content-Type", asset.mimeType),
                        ("Cache-Control", "public, max-age=31536000, immutable"),
                        skipCertificate
                    ];
                    body = firstChunk;
                    streaming_strategy = streamingStrategy;
                };
            };
        };
    };

    public func httpStreamingCallback(storage : FileStorage, token : Http.StreamingToken) : Http.StreamingCallbackHttpResponse {  
        let path = token.resource;
        let asset = switch (storage.assets.get(path)) {
            case null Debug.trap("Invalid resource");
            case (?asset) asset;
        };
        let nextChunk = asset.chunks[token.index];
        let nextToken = if (token.index + 1 < asset.chunks.size()) {
            ?{
                resource = path;
                index = token.index + 1;
            };
        } else {
            null;
        };
        {
            body = nextChunk;
            token = nextToken;
        };
    };
};
