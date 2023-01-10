export default class DeleteReplyOnCommentUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId, replyCommentId } =
      useCasePayload;

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
    await this._commentsRepository.deleteReplyOnComment({
      threadId,
      commentId,
      replyCommentId,
      ownerId: credentialId,
    });
  }
}
