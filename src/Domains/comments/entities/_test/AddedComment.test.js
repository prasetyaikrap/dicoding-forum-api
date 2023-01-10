import AddedComment from "#Domains/comments/entities/AddedComment";

describe("AddedComment Entities", () => {
  it("should return AddedComment Object", () => {
    // Arrange
    const qResult = {
      id: "comment-12345",
      content: "New comment for thread",
      owner: "user-12345",
    };
    const expectedAddedComment = {
      id: qResult.id,
      content: qResult.content,
      owner: qResult.owner,
    };

    // Action
    const { addedComment } = new AddedComment(qResult);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
  });
});
