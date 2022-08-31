class SaltNotFoundError extends Error {
    constructor(args) {
        super(args);
        this.name = "SaltNotFoundError"
    }
}

class IvNotFoundError extends Error {
    constructor(args) {
        super(args);
        this.name = "IvNotFoundError"
    }
}

class SessionIDNotFoundError extends Error {
    constructor(args) {
        super(args);
        this.name = "SessionIDNotFoundError"
    }
}

class NoUserError extends Error {
    constructor(args) {
        super(args);
        this.name = "NoUserError"
    }
}

class NoPasswordError extends Error {
    constructor(args) {
        super(args);
        this.name = "NoPasswordError"
    }
}


module.exports.NoUserError = NoUserError;
module.exports.NoPasswordError = NoPasswordError;
module.exports.SaltNotFoundError = SaltNotFoundError;
module.exports.IvNotFoundError = IvNotFoundError;
module.exports.SessionIDNotFoundError = SessionIDNotFoundError;
