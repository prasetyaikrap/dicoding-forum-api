import AuthorizationError from "#Commons/exceptions/AuthorizationError";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
import { jest } from "@jest/globals";
import DeleteReplyOnCommentUseCase from "#Applications/usecase/threads/DeleteReplyOnCommentUseCase";

describe("DeleteCommentOnThreadUseCase", () => {
  it("It should orchestrating delete reply on comment correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "reply-12345",
      replyCommentId: "comment-12345",
    };

    //mock
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.deleteReplyOnComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyOnCommentUseCase = new DeleteReplyOnCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Assert

    await expect(
      deleteReplyOnCommentUseCase.execute(useCasePayload)
    ).resolves.not.toThrow(AuthorizationError);
    await expect(
      deleteReplyOnCommentUseCase.execute(useCasePayload)
    ).resolves.not.toThrow(NotFoundError);
  });
});
