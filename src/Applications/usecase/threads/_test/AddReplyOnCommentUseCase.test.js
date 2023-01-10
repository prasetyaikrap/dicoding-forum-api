import AddReplyOnCommentUseCase from "#Applications/usecase/threads/AddReplyOnCommentUseCase";
import { jest } from "@jest/globals";
import CommentsRepository from "#Domains/comments/CommentsRepository";

describe("AddCommentOnThreadUseCase", () => {
  it("Should orchestrating addCommentOnThreadUseCase correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "comment-12345",
      replyPayload: {
        content: "new reply on comment comment-12345",
      },
    };
    const expectedAddedReplyOnComment = {
      id: "reply-12345",
      content: useCasePayload.replyPayload.content,
      owner: useCasePayload.credentialId,
    };

    // Mock
    const mockCommentRepository = new CommentsRepository();
    mockCommentRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addReplyOnComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReplyOnComment));

    const addReplyOnCommentUseCase = new AddReplyOnCommentUseCase({
      commentsRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyOnCommentUseCase.execute(useCasePayload);

    //Assert
    expect(mockCommentRepository.addReplyOnComment).toHaveBeenCalledWith({
      ownerId: useCasePayload.credentialId,
      threadId: useCasePayload.threadId,
      replyCommentId: useCasePayload.commentId,
      content: useCasePayload.replyPayload.content,
    });
    expect(mockCommentRepository.verifyCommentExistence).toHaveBeenCalledWith({
      threadId: "thread-12345",
      commentId: "comment-12345",
    });
    expect(addedReply).toStrictEqual(expectedAddedReplyOnComment);
  });
});
