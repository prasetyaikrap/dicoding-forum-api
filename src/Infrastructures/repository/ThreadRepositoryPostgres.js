import InvariantError from "#Commons/exceptions/InvariantError";
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
      text: "INSERT INTO threads(id, title, body, owner, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, owner, title",
      values: [id, title, body, ownerId, now, now],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}
