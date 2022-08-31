export class SaltNotFoundError extends Error {
    constructor(args: string | undefined) {
        super(args);
        this.name = "SaltNotFoundError"
    }
}

export class IvNotFoundError extends Error {
    constructor(args: string | undefined) {
        super(args);
        this.name = "IvNotFoundError"
    }
}

export class SessionIDNotFoundError extends Error {
    constructor(args: string | undefined) {
        super(args);
        this.name = "SessionIDNotFoundError"
    }
}

export class NoUserError extends Error {
    constructor(args: string | undefined) {
        super(args);
        this.name = "NoUserError"
    }
}

export class NoPasswordError extends Error {
    constructor(args: string | undefined) {
        super(args);
        this.name = "NoPasswordError"
    }
}
