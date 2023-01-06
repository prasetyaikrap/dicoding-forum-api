import DeleteCommentOnThreadUseCase from "#Applications/usecase/threads/DeleteCommentOnThreadUseCase";
import AuthorizationError from "#Commons/exceptions/AuthorizationError";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
import { jest } from "@jest/globals";

describe("DeleteCommentOnThreadUseCase", () => {
  it("It should orchestrating delete comment on thread correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialId: "user-12345",
      threadId: "thread-12345",
      commentId: "comment-12345",
    };

    //mock
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyCommentExistence = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.deleteCommentOnThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentOnThreadUseCase = new DeleteCommentOnThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Assert

    await expect(
      deleteCommentOnThreadUseCase.execute(useCasePayload)
    ).resolves.not.toThrow(AuthorizationError);
    await expect(
      deleteCommentOnThreadUseCase.execute(useCasePayload)
    ).resolves.not.toThrow(NotFoundError);
  });
});
