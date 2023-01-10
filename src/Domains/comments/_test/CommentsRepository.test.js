import CommentsRepository from "#Domains/comments/CommentsRepository";

describe("ThredRepository", () => {
  it("Should throw error when invoke abstract behavior", async () => {
    // Arrange
    const commentsRepository = new CommentsRepository();

    // Action & Assert
    await expect(commentsRepository.addCommentOnThread({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.addReplyOnComment({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.deleteCommentOnThread({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.deleteReplyOnComment({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyCommentOwner({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyThreadExistence({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyCommentExistence({})).rejects.toThrow(
      "THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
