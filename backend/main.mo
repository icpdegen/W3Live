import MultiUserSystem "auth-multi-user/management";
import FileStorage "file-storage/file-storage";
import Http "file-storage/http";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Tests "tests";

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
        return MultiUserSystem.isAdmin(multiUserState, caller);
    };

    // ** Application-specific user profile management **
    public type UserProfile = {
        name : Text;
        // Other user's metadata if needed
    };

    // Equality function for Principal
    func principalEq(a : Principal, b : Principal) : Bool {
        Principal.toText(a) == Principal.toText(b)
    };

    var userProfiles = HashMap.HashMap<Principal, UserProfile>(0, principalEq, Principal.hash);

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        userProfiles.get(caller);
    };

    public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
        ignore userProfiles.put(caller, profile);
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

    // Equality function for Nat
    func natEq(a : Nat, b : Nat) : Bool {
        a == b
    };

    // Hash function for Nat
    func natHash(n : Nat) : Hash.Hash {
        Hash.hash(n)
    };

    var data = HashMap.HashMap<Nat, Data>(0, natEq, natHash);

    public shared ({ caller }) func createData(content : Text, metadata : Text) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can create data");
        };
        let id = data.size();
        let newData = {
            id;
            content;
            metadata;
            owner = caller;
            createdAt = Time.now();
            updatedAt = Time.now();
        };
        ignore data.put(id, newData);
    };

    public shared ({ caller }) func updateData(id : Nat, content : Text, metadata : Text) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can update data");
        };
        let existingData = data.get(id);
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
                ignore data.put(id, updatedData);
            };
        };
    };

    public shared ({ caller }) func deleteData(id : Nat) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can delete data");
        };
        let existingData = data.get(id);
        switch (existingData) {
            case null {
                Debug.trap("Data not found");
            };
            case (?existing) {
                if (existing.owner != caller) {
                    Debug.trap("Unauthorized: Only the owner can delete this data");
                };
                ignore data.remove(id);
            };
        };
    };

    public query ({ caller }) func getData(id : Nat) : async ?Data {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can view data");
        };
        data.get(id);
    };

    public query ({ caller }) func getAllData() : async [Data] {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only users and admins can view data");
        };
        Iter.toArray(data.vals());
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

    // ** Testing functionality **
    public func runTests() : async Text {
        let results = await Tests.runAllTests();
        Tests.formatTestResults(results);
    };

    // ** Canister upgrade hooks **
    system func preupgrade() {
        Debug.print("Starting canister upgrade...");
    };

    system func postupgrade() {
        Debug.print("Canister upgrade completed successfully!");
    };

    // ** Health check endpoint **
    public query func health() : async {
        status: Text;
        timestamp: Time.Time;
        canister_id: Text;
        memory_usage: Nat;
    } {
        {
            status = "healthy";
            timestamp = Time.now();
            canister_id = "w3live_backend";
            memory_usage = 0; // Could implement actual memory usage tracking
        };
    };

    // ** Version information **
    public query func version() : async Text {
        "W3Live Backend v1.0.0 - Built for Internet Computer";
    };
};
