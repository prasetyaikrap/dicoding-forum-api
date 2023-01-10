import AddCommentOnThreadUseCase from "#Applications/usecase/threads/AddCommentOnThreadUseCase";
import CommentsRepository from "#Domains/comments/CommentsRepository";
import { jest } from "@jest/globals";

describe("AddCommentOnThreadUseCase", () => {
  it("Should orchestrating addCommentOnThreadUseCase correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentPayload: {
        content: "new comment on thread-12345",
      },
    };
    const expectedAddedCommentOnThread = {
      id: "comment-12345",
      content: useCasePayload.commentPayload.content,
      owner: useCasePayload.credentialId,
    };

    // Mock
    const mockCommentsRepository = new CommentsRepository();
    mockCommentsRepository.verifyThreadExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.addCommentOnThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedCommentOnThread));

    const addCommentOnThread = new AddCommentOnThreadUseCase({
      commentsRepository: mockCommentsRepository,
    });

    // Action
    const addedComment = await addCommentOnThread.execute(useCasePayload);

    //Assert
    expect(mockCommentsRepository.addCommentOnThread).toHaveBeenCalledWith({
      ownerId: useCasePayload.credentialId,
      threadId: useCasePayload.threadId,
      content: useCasePayload.commentPayload.content,
    });
    expect(addedComment).toStrictEqual(expectedAddedCommentOnThread);
  });
});
