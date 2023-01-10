import AddReplyOnComment from "#Domains/comments/entities/AddReplyOnComment";

export default class AddReplyOnCommentUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId, replyPayload } = useCasePayload;

    // verify payload
    const { content } = new AddReplyOnComment(replyPayload);

    // verify thread existence
    await this._commentsRepository.verifyCommentExistence({
      threadId,
      commentId,
    });

    // add comment to database
    return await this._commentsRepository.addReplyOnComment({
      ownerId: credentialId,
      threadId,
      replyCommentId: commentId,
      content,
    });
  }
}
