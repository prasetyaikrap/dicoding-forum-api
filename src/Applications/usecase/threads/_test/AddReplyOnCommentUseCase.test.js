import ThreadRepository from "#Domains/threads/ThreadsRepository";
import AddReplyOnCommentUseCase from "#Applications/usecase/threads/AddReplyOnCommentUseCase";
import { jest } from "@jest/globals";

describe("AddCommentOnThreadUseCase", () => {
  it("Should orchestrating addCommentOnThreadUseCase correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "comment-12345",
      commentPayload: {
        content: "new reply on comment comment-12345",
      },
    };
    const expectedAddedReplyOnComment = {
      id: "reply-12345",
      content: useCasePayload.commentPayload.content,
      owner: useCasePayload.credentialId,
    };

    // Mock
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addReplyOnComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReplyOnComment));

    const addReplyOnCommentUseCase = new AddReplyOnCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyOnCommentUseCase.execute(useCasePayload);

    //Assert
    expect(mockThreadRepository.addReplyOnComment).toBeCalledWith({
      ownerId: useCasePayload.credentialId,
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      content: useCasePayload.commentPayload.content,
    });
    expect(addedReply).toStrictEqual(expectedAddedReplyOnComment);
  });
});
