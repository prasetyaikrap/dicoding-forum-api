export default class AddReplyOnComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content } = payload;

    this.content = content;
  }

  _verifyPayload(payload) {
    const { content } = payload;
    if (!content || content === "") {
      throw new Error("ADD_REPLY_ON_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (typeof content !== "string") {
      throw new Error("ADD_REPLY_ON_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}
