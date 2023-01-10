import DeleteCommentOnThreadUseCase from "#Applications/usecase/threads/DeleteCommentOnThreadUseCase";
import CommentsRepository from "#Domains/comments/CommentsRepository";
import { jest } from "@jest/globals";

describe("DeleteCommentOnThreadUseCase", () => {
  it("should orchestrating delete comment on thread correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "comment-12345",
    };

    //mock
    const mockCommentRepository = new CommentsRepository();
    mockCommentRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentOnThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentOnThreadUseCase = new DeleteCommentOnThreadUseCase({
      commentsRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentOnThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyCommentExistence).toHaveBeenCalledWith({
      threadId: "thread-12345",
      commentId: "comment-12345",
    });
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith({
      ownerId: "user-12345",
      commentId: "comment-12345",
    });
    expect(mockCommentRepository.deleteCommentOnThread).toHaveBeenCalledWith({
      ownerId: "user-12345",
      commentId: "comment-12345",
      threadId: "thread-12345",
    });
  });
});
