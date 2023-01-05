import AddCommentOnThread from "#Domains/threads/entities/AddCommentOnThread";

export default class AddCommentOnThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { credentialId, threadId, commentPayload } = useCasePayload;

    // verify payload
    const { content } = new AddCommentOnThread(commentPayload);

    // add comment to database
    return this._threadRepository.addCommentOnThread({
      ownerId: credentialId,
      threadId,
      content,
    });
  }
}
