import pool from "#Infrastructures/database/postgres/pool";

/* istanbul ignore file */
const now = new Date();

const ThreadsTableTestHelper = {
  async addNewThread({
    title = "Test Helper Thread",
    body = "Test Helper body",
    owner = "user-12345",
  }) {
    const id = "thread-12345";
    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6, $7)",
      values: [id, title, body, owner, false, now, now],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("TRUNCATE TABLE threads CASCADE");
  },
};

export default ThreadsTableTestHelper;
