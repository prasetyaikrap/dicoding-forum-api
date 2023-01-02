import ClientError from "@Commons/exceptions/ClientError";

export default class InvariantError extends ClientError {
  constructor(message) {
    super(message);
    this.name = "InvariantError";
  }
}
