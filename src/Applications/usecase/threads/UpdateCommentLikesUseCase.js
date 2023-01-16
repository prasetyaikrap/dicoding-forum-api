export default class UpdateCommentLikesUseCase {
  constructor({ commentsRepository }) {
    this._commentsRepository = commentsRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    //Verify comment existence
    await this._commentsRepository.verifyCommentExistence({
      threadId,
      commentId,
    });

    // Update Likes
    await this._commentsRepository.updateCommentLikes({
      threadId,
      commentId,
      userId,
    });
  }
}
