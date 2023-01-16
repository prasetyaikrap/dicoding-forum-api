import CommentsRepository from "#Domains/comments/CommentsRepository";

describe("ThredRepository", () => {
  it("Should throw error when invoke abstract behavior", async () => {
    // Arrange
    const commentsRepository = new CommentsRepository();

    // Action & Assert
    await expect(commentsRepository.addCommentOnThread({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.addReplyOnComment({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.deleteCommentOnThread({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.deleteReplyOnComment({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyCommentOwner({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyThreadExistence({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.verifyCommentExistence({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository.updateCommentLikes({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      commentsRepository._verifyUserCommentLikes({})
    ).rejects.toThrow("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(commentsRepository._incrementCommentLikes({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository._decrementCommentLikes({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentsRepository._addUserCommentLikes({})).rejects.toThrow(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      commentsRepository._deleteUserCommentLikes({})
    ).rejects.toThrow("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
