import ClientError from "@Commons/exceptions/ClientError";

export default class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
