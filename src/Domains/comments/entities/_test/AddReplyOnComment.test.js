import AddReplyOnComment from "#Domains/comments/entities/AddReplyOnComment";

describe("AddReplyOnComment Entities", () => {
  it("Should throw error when not contain needed property", () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new AddReplyOnComment(payload)).toThrow(
      "ADD_REPLY_ON_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when not meet data type specification", () => {
    // Arrange
    const payload = { content: 12345 };

    // Action & Assert
    expect(() => new AddReplyOnComment(payload)).toThrow(
      "ADD_REPLY_ON_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("Should throw error when content is empty string", () => {
    // Arrange
    const payload = { content: "" };

    // Action & Assert
    expect(() => new AddReplyOnComment(payload)).toThrow(
      "ADD_REPLY_ON_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should create addCommentOnThread Object properly", () => {
    // Arrange
    const payload = {
      content: "new reply on comment",
    };

    // Action
    const addedReplyOnComment = new AddReplyOnComment(payload);

    // Assert
    expect(addedReplyOnComment.content).toEqual(payload.content);
  });
});
