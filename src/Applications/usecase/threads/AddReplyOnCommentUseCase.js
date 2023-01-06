import AddReplyOnComment from "#Domains/threads/entities/AddReplyOnComment";

export default class AddReplyOnCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId, replyPayload } = useCasePayload;

    // verify payload
    const { content } = new AddReplyOnComment(replyPayload);

    // verify thread existence
    await this._threadRepository.verifyCommentExistence({
      threadId,
      commentId,
    });

    // add comment to database
    return this._threadRepository.addReplyOnComment({
      ownerId: credentialId,
      threadId,
      replyCommentId: commentId,
      content,
    });
  }
}
