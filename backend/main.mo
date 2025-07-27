import MultiUserSystem "auth-multi-user/management";
import FileStorage "file-storage/file-storage";
import Http "file-storage/http";
import Map "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Time "mo:base/Time";

actor {
    // Initialize the multi-user system state
    let multiUserState = MultiUserSystem.initState();

    // Initialize auth (first caller becomes admin, others become users)
    public shared ({ caller }) func initializeAuth() : async () {
        MultiUserSystem.initializeAuth(multiUserState, caller);
    };

    public query ({ caller }) func getCurrentUserRole() : async MultiUserSystem.UserRole {
        MultiUserSystem.getUserRole(multiUserState, caller);
    };

    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        MultiUserSystem.isAdmin(multiUserState, caller);
    };

    // ** Application-specific user profile management **
    public type UserProfile = {
        name : Text;
        // Other user's metadata if needed
    };

    transient let principalMap = Map.Make<Principal>(Principal.compare);
    var userProfiles = principalMap.empty<UserProfile>();

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

    // ** Start of application specific logic, TODO: adapt to your needs **
    // This is an example to how to protect data creation, update and deletion

    type Data = {
        id : Nat;
        content : Text;
        metadata : Text;
        owner : Principal;
        createdAt : Time.Time;
        updatedAt : Time.Time;
    };

    transient let dataMap = Map.Make<Nat>(Nat.compare);
    var data : Map.Map<Nat, Data> = dataMap.empty<Data>();

    public shared ({ caller }) func createData(content : Text, metadata : Text) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can create data");
        };
        let id = dataMap.size(data);
        let newData = {
            id;
            content;
            metadata;
            owner = caller;
            createdAt = Time.now();
            updatedAt = Time.now();
        };
        data := dataMap.put(data, id, newData);
    };

    public shared ({ caller }) func updateData(id : Nat, content : Text, metadata : Text) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can update data");
        };
        let existingData = dataMap.get(data, id);
        switch (existingData) {
            case null {
                Debug.trap("Data not found");
            };
            case (?existing) {
                if (existing.owner != caller) {
                    Debug.trap("Unauthorized: Only the owner can update this data");
                };
                let updatedData = {
                    id;
                    content;
                    metadata;
                    owner = caller;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                };
                data := dataMap.put(data, id, updatedData);
            };
        };
    };

    public shared ({ caller }) func deleteData(id : Nat) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can delete data");
        };
        let existingData = dataMap.get(data, id);
        switch (existingData) {
            case null {
                Debug.trap("Data not found");
            };
            case (?existing) {
                if (existing.owner != caller) {
                    Debug.trap("Unauthorized: Only the owner can delete this data");
                };
                data := dataMap.delete(data, id);
            };
        };
    };

    public query ({ caller }) func getData(id : Nat) : async ?Data {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can view data");
        };
        dataMap.get(data, id);
    };

    public query ({ caller }) func getAllData() : async [Data] {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can view data");
        };
        Iter.toArray(dataMap.vals(data));
    };

    // ** File storage **
    var storage = FileStorage.new();

    public func list() : async [FileStorage.FileMetadata] {
        FileStorage.list(storage);
    };

    public func upload(path : Text, mimeType : Text, chunk : Blob, complete : Bool) : async () {
        FileStorage.upload(storage, path, mimeType, chunk, complete);
    };

    public func delete(path : Text) : async () {
        FileStorage.delete(storage, path);
    };

    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        FileStorage.fileRequest(storage, request, httpStreamingCallback);
    };

    public query func httpStreamingCallback(token : Http.StreamingToken) : async Http.StreamingCallbackHttpResponse {
        FileStorage.httpStreamingCallback(storage, token);
    };
};





