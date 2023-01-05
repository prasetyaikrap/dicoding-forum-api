export default class ThreadRepository {
  async addNewThread({ ownerId, title, body }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async addCommentOnThread({ ownerId, threadId, content }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async addReplyOnComment({ ownerId, threadId, replyCommentId, content }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteCommentOnThread({ ownerId, threadId, commentId }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteReplyOnComment({ ownerId, threadId, commentId, replyCommentId }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyCommentOwner({ threadId, commentId, ownerId }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyReplyOwner({ threadId, commentId, replyCommentId, ownerId }) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getThreadById(threadId) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}
