import ClientError from "#Commons/exceptions/ClientError";

export default class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}
