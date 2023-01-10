import AuthorizationError from "#Commons/exceptions/AuthorizationError";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import CommentsRepository from "#Domains/comments/CommentsRepository";
import AddedComment from "#Domains/comments/entities/AddedComment";
import AddedReply from "#Domains/comments/entities/AddedReply";

export default class CommentsRepositoryPostgress extends CommentsRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentOnThread({ ownerId, threadId, content }) {
    const id = `comment-${this._idGenerator()}`;
    const now = new Date();

    const query = {
      text: `INSERT INTO thread_comments(id, content, owner, thread_id, is_deleted, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $6) 
            RETURNING id, content, owner`,
      values: [id, content, ownerId, threadId, false, now],
    };
    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async deleteCommentOnThread({ ownerId, threadId, commentId }) {
    const now = new Date();
    const query = {
      text: `UPDATE thread_comments 
            SET is_deleted = $1, updated_at = $2 
            WHERE id = $3 AND thread_id = $4 AND owner = $5`,
      values: [true, now, commentId, threadId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Failed to delete. Thread not found.");
    }
  }

  async addReplyOnComment({ ownerId, threadId, replyCommentId, content }) {
    const id = `reply-${this._idGenerator()}`;
    const now = new Date();

    const query = {
      text: `INSERT INTO thread_comments(id, content, owner, thread_id, reply_comment_id, is_deleted, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $7) 
            RETURNING id, content, owner`,
      values: [id, content, ownerId, threadId, replyCommentId, false, now],
    };
    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async deleteReplyOnComment({ ownerId, threadId, commentId, replyCommentId }) {
    const now = new Date();
    const query = {
      text: `UPDATE thread_comments 
            SET is_deleted = $1, updated_at = $2 
            WHERE id = $3 AND thread_id = $4 AND reply_comment_id = $5 AND owner = $6`,
      values: [true, now, commentId, threadId, replyCommentId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Failed to delete. Thread or Comment not found.");
    }
  }

  async verifyCommentOwner({ commentId, ownerId }) {
    const query = {
      text: `SELECT id 
            FROM thread_comments tc 
            WHERE tc.id = $1 AND tc.owner = $2`,
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError("Not Authorized");
    }
  }

  async verifyThreadExistence({ threadId }) {
    const query = {
      text: `SELECT id FROM threads t WHERE t.id = $1`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Thread is not exist");
    }
  }

  async verifyCommentExistence({ threadId, commentId }) {
    const query = {
      text: `SELECT id FROM thread_comments tc WHERE tc.thread_id = $1 AND tc.id = $2`,
      values: [threadId, commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Comment is not exist");
    }
  }
}
