import AddedReply from "#Domains/comments/entities/AddedReply";

describe("AddedReply Entities", () => {
  it("should return AddedReply Object", () => {
    // Arrange
    const qResult = {
      id: "reply-12345",
      content: "New reply for comment",
      owner: "user-12345",
    };
    const expectedAddedReply = {
      id: qResult.id,
      content: qResult.content,
      owner: qResult.owner,
    };

    // Action
    const { addedReply } = new AddedReply(qResult);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
  });
});
