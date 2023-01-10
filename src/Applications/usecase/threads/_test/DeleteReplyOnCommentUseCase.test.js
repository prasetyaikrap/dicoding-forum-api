import { jest } from "@jest/globals";
import DeleteReplyOnCommentUseCase from "#Applications/usecase/threads/DeleteReplyOnCommentUseCase";
import CommentsRepository from "#Domains/comments/CommentsRepository";

describe("DeleteCommentOnThreadUseCase", () => {
  it("should orchestrating delete reply on comment correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "reply-12345",
      replyCommentId: "comment-12345",
    };

    //mock
    const mockCommentsRepository = new CommentsRepository();
    mockCommentsRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.deleteReplyOnComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyOnCommentUseCase = new DeleteReplyOnCommentUseCase({
      commentsRepository: mockCommentsRepository,
    });

    // Action
    await deleteReplyOnCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentsRepository.verifyCommentExistence).toBeCalledWith({
      threadId: "thread-12345",
      commentId: "reply-12345",
    });
    expect(mockCommentsRepository.verifyCommentOwner).toBeCalledWith({
      ownerId: "user-12345",
      commentId: "reply-12345",
    });
    expect(mockCommentsRepository.deleteReplyOnComment).toBeCalledWith({
      ownerId: "user-12345",
      commentId: "reply-12345",
      threadId: "thread-12345",
      replyCommentId: "comment-12345",
    });
  });
});
