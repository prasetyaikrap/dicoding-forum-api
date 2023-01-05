import AddCommentOnThread from "#Domains/threads/entities/AddCommentOnThread";

describe("AddCommentOnThread Entities", () => {
  it("Should throw error when not contain needed property", () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new AddCommentOnThread(payload)).toThrowError(
      "ADD_COMMENT_ON_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when not meet data type specification", () => {
    // Arrange
    const payload = { content: 12345 };

    // Action & Assert
    expect(() => new AddCommentOnThread(payload)).toThrowError(
      "ADD_COMMENT_ON_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("Should throw error when content is empty string", () => {
    // Arrange
    const payload = { content: "" };

    // Action & Assert
    expect(() => new AddCommentOnThread(payload)).toThrowError(
      "ADD_COMMENT_ON_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should create addCommentOnThread Object properly", () => {
    // Arrange
    const payload = {
      content: "new comment on thread",
    };

    // Action
    const addedCommentOnThread = new AddCommentOnThread(payload);

    // Assert
    expect(addedCommentOnThread.content).toEqual(payload.content);
  });
});
