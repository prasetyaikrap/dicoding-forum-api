export default class DeleteCommentOnThreadUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId } = useCasePayload;
    // verify comment exictence
    await this._commentsRepository.verifyCommentExistence({
      threadId,
      commentId,
    });

    // verify comment owner
    await this._commentsRepository.verifyCommentOwner({
      commentId,
      ownerId: credentialId,
    });

    // Delete Comment
    await this._commentsRepository.deleteCommentOnThread({
      threadId,
      commentId,
      ownerId: credentialId,
    });
  }
}
