export default class AddCommentOnThread {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content } = payload;

    this.content = content;
  }

  _verifyPayload(payload) {
    const { content } = payload;
    if (!content || content === "") {
      throw new Error("ADD_COMMENT_ON_THREAD.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (typeof content !== "string") {
      throw new Error("ADD_COMMENT_ON_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}
