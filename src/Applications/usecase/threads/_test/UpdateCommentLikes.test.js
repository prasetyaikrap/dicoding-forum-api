import UpdateCommentLikesUseCase from "#Applications/usecase/threads/UpdateCommentLikesUseCase";
import CommentsRepository from "#Domains/comments/CommentsRepository";
import { jest } from "@jest/globals";

describe("UpdateCommentLikesUseCase", () => {
  it("Should orchestrate update likes on comment correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-12345",
      commentId: "comment-12345",
      userId: "user-12345",
    };

    // mock
    const mockCommentRepository = new CommentsRepository();
    mockCommentRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.updateCommentLikes = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const updateCommentLikesUseCase = new UpdateCommentLikesUseCase({
      commentsRepository: mockCommentRepository,
    });

    // Action
    await updateCommentLikesUseCase.execute(useCasePayload);

    //Assert
    expect(mockCommentRepository.verifyCommentExistence).toHaveBeenCalledWith({
      threadId: "thread-12345",
      commentId: "comment-12345",
    });
    expect(mockCommentRepository.updateCommentLikes).toHaveBeenCalledWith({
      threadId: "thread-12345",
      commentId: "comment-12345",
      userId: "user-12345",
    });
  });
});
