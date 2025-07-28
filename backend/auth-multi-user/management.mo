import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

module {
    public type UserRole = { #admin; #user; #guest; };
    public type ApprovalStatus = { #approved; #rejected; #pending; };

    public type MultiUserSystemState = {
        var adminAssigned : Bool;
        userRoles : HashMap.HashMap<Principal, UserRole>;
        approvalStatus : HashMap.HashMap<Principal, ApprovalStatus>;
    };

    // Equality function for Principal
    public func principalEq(a : Principal, b : Principal) : Bool {
        Principal.toText(a) == Principal.toText(b)
    };

    public func initState() : MultiUserSystemState {
        {
            var adminAssigned = false;
            userRoles = HashMap.HashMap<Principal, UserRole>(0, principalEq, Principal.hash);
            approvalStatus = HashMap.HashMap<Principal, ApprovalStatus>(0, principalEq, Principal.hash);
        };
    };

    public func initializeAuth(state : MultiUserSystemState, caller : Principal) {
        if (not Principal.isAnonymous(caller)) {
            switch (state.userRoles.get(caller)) {
                case (?_) {};
                case (null) {
                    if (not state.adminAssigned) {
                        ignore state.userRoles.put(caller, #admin);
                        ignore state.approvalStatus.put(caller, #approved);
                        state.adminAssigned := true;
                    } else {
                        ignore state.userRoles.put(caller, #user);
                        ignore state.approvalStatus.put(caller, #pending);
                    };
                };
            };
        };
    };

    public func getApprovalStatus(state : MultiUserSystemState, caller : Principal) : ApprovalStatus {
        switch (state.approvalStatus.get(caller)) {
            case (?status) status;
            case null Debug.trap("User is not registered");
        };
    };

    public func getUserRole(state : MultiUserSystemState, caller : Principal) : UserRole {
        if (Principal.isAnonymous(caller)) {
            #guest;
        } else {
            switch (state.userRoles.get(caller)) {
                case (?role) { role };
                case (null) {
                    Debug.trap("User is not registered");
                };
            };
        };
    };

    public func hasPermission(state : MultiUserSystemState, caller : Principal, requiredRole : UserRole, requireApproval : Bool) : Bool {
        let role = getUserRole(state, caller);
        if (requireApproval) {
            let approval = getApprovalStatus(state, caller);
            if (approval != #approved) {
                return false;
            };
        };
        switch (role) {
            case (#admin) true;
            case (role) {
                switch (requiredRole) {
                    case (#admin) false;
                    case (#user) role == #user;
                    case (#guest) true;
                };
            };
        };
    };

    public func isAdmin(state : MultiUserSystemState, caller : Principal) : Bool {
        getUserRole(state, caller) == #admin;
    };

    public func assignRole(state : MultiUserSystemState, caller : Principal, user : Principal, newRole : UserRole) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can assign user roles");
        };
        ignore state.userRoles.put(user, newRole);
    };

    public func setApproval(state : MultiUserSystemState, caller : Principal, user : Principal, approval : ApprovalStatus) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can approve users");
        };
        ignore state.approvalStatus.put(user, approval);
    };

    public type UserInfo = {
        principal : Principal;
        role : UserRole;
        approval : ApprovalStatus;
    };

    public func listUsers(state : MultiUserSystemState, caller : Principal) : [UserInfo] {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can approve users");
        };
        let usersIter = state.userRoles.entries();
        Iter.toArray(
            Iter.map<(Principal, UserRole), UserInfo>(
                usersIter,
                func ((principal, role)) {
                    let approval = getApprovalStatus(state, principal);
                    {
                        principal = principal;
                        role = role;
                        approval = approval;
                    }
                }
            )
        );
    };
}
