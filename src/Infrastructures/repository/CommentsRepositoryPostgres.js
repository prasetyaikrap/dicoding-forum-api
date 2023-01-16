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

  async updateCommentLikes({ threadId, commentId, userId }) {
    const rowCount = await this._verifyUserCommentLikes({
      threadId,
      commentId,
      userId,
    });

    if (rowCount) {
      await this._deleteUserCommentLikes({ threadId, commentId, userId });
      await this._decrementCommentLikes({ threadId, commentId });
    }

    if (!rowCount) {
      await this._addUserCommentLikes({ threadId, commentId, userId });
      await this._incrementCommentLikes({ threadId, commentId });
    }
  }

  async _verifyUserCommentLikes({ threadId, commentId, userId }) {
    const query = {
      text: `SELECT id FROM user_comment_likes 
            WHERE comment_id = $1
            AND thread_id = $2
            AND user_id = $3`,
      values: [commentId, threadId, userId],
    };
    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async _incrementCommentLikes({ threadId, commentId }) {
    const query = {
      text: `UPDATE thread_comments SET likes = likes + 1
            WHERE id = $1
            AND thread_id = $2`,
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Comment Not Found");
    }
  }

  async _decrementCommentLikes({ threadId, commentId }) {
    const query = {
      text: `UPDATE thread_comments SET likes = likes - 1
            WHERE id = $1
            AND thread_id = $2`,
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Comment Not Found");
    }
  }

  async _addUserCommentLikes({ threadId, commentId, userId }) {
    const query = {
      text: `INSERT INTO user_comment_likes(thread_id, comment_id, user_id)
            VALUES($1, $2, $3) 
            RETURNING id`,
      values: [threadId, commentId, userId],
    };
    await this._pool.query(query);
  }

  async _deleteUserCommentLikes({ threadId, commentId, userId }) {
    const query = {
      text: `DELETE FROM user_comment_likes
            WHERE thread_id = $1
            AND comment_id = $2
            AND user_id = $3`,
      values: [threadId, commentId, userId],
    };
    await this._pool.query(query);
  }
}
