import ClientError from "@Commons/exceptions/ClientError";

export default class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}
