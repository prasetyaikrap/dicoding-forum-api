export default class DeleteReplyOnCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId, replyCommentId } =
      useCasePayload;

    // verify comment exictence
    await this._threadRepository.verifyCommentExistence({
      threadId,
      commentId,
    });

    // verify comment owner
    await this._threadRepository.verifyCommentOwner({
      commentId,
      ownerId: credentialId,
    });

    // Delete Comment
    await this._threadRepository.deleteReplyOnComment({
      threadId,
      commentId,
      replyCommentId,
      ownerId: credentialId,
    });
  }
}
