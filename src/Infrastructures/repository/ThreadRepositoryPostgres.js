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
              tc.likes AS tc_likes,
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
}
