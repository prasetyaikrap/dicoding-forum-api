import AuthorizationError from "#Commons/exceptions/AuthorizationError";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import GetThreadDetails from "#Domains/threads/entities/GetThreadDetails";
import ThreadRepository from "#Domains/threads/ThreadsRepository";

export default class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addNewThread({ ownerId, title, body }) {
    // Define Values
    const id = `thread-${this._idGenerator()}`;
    const now = new Date();

    // Query
    const query = {
      text: `INSERT INTO threads(id, title, body, owner, created_at, updated_at) 
            VALUES($1, $2, $3, $4, $5, $5) 
            RETURNING id, owner, title`,
      values: [id, title, body, ownerId, now],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
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
    return result.rows[0];
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
    return result.rows[0];
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

  async getThreadById(threadId) {
    const query = {
      text: `SELECT
              t.id AS t_id,
              t.title AS t_title,
              t.body AS t_body,
              t.is_deleted AS t_is_deleted,
              t.created_at AS t_date,
              ut.username AS ut_username,
              tc.id AS tc_id,
              tc.content AS tc_content,
              tc.created_at AS tc_date,
              tc.is_deleted AS tc_is_deleted,
              tc.reply_comment_id AS tc_reply_comment_id,
              utc.username AS utc_username
            FROM threads t
            JOIN users ut ON t.owner = ut.id
            JOIN thread_comments tc ON t.id = tc.thread_id
            JOIN users utc ON tc.owner = utc.id
            WHERE t.id = $1
            ORDER BY tc.created_at ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Failed to get thread details. Thread not found");
    }
    return new GetThreadDetails(result.rows);
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
