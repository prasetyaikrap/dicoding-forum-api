export default class CommentsRepository {
  async addCommentOnThread({ ownerId, threadId, content }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async addReplyOnComment({ ownerId, threadId, replyCommentId, content }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteCommentOnThread({ ownerId, threadId, commentId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteReplyOnComment({ ownerId, threadId, commentId, replyCommentId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentOwner({ threadId, commentId, ownerId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyThreadExistence({ threadId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentExistence({ threadId, commentId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async updateCommentLikes({ threadId, commentId, userId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async _verifyUserCommentLikes({ threadId, commentId, userId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async _incrementCommentLikes({ threadId, commentId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async _decrementCommentLikes({ threadId, commentId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async _addUserCommentLikes({ threadId, commentId, userId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async _deleteUserCommentLikes({ threadId, commentId, userId }) {
    throw new Error("COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}
