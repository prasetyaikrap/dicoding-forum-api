import AddCommentOnThreadUseCase from "#Applications/usecase/threads/AddCommentOnThreadUseCase";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
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
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addCommentOnThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedCommentOnThread));

    const addCommentOnThread = new AddCommentOnThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentOnThread.execute(useCasePayload);

    //Assert
    expect(mockThreadRepository.addCommentOnThread).toBeCalledWith({
      ownerId: useCasePayload.credentialId,
      threadId: useCasePayload.threadId,
      content: useCasePayload.commentPayload.content,
    });
    expect(addedComment).toStrictEqual(expectedAddedCommentOnThread);
  });
});
