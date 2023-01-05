import AddReplyOnComment from "#Domains/threads/entities/AddReplyOnComment";

export default class AddReplyOnCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentId, commentPayload } =
      useCasePayload;

    // verify payload
    const { content } = new AddReplyOnComment(commentPayload);

    // add comment to database
    return this._threadRepository.addReplyOnComment({
      ownerId: credentialId,
      threadId,
      commentId,
      content,
    });
  }
}
