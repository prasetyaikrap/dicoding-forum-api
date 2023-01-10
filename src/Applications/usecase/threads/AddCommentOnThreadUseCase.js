import AddCommentOnThread from "#Domains/comments/entities/AddCommentOnThread";

export default class AddCommentOnThreadUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentPayload } = useCasePayload;

    // verify payload
    const { content } = new AddCommentOnThread(commentPayload);

    // verify thread existence
    await this._commentsRepository.verifyThreadExistence({ threadId });

    // add comment to database
    return await this._commentsRepository.addCommentOnThread({
      ownerId: credentialId,
      threadId,
      content,
    });
  }
}
