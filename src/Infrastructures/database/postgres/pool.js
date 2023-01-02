/* istanbul ignore file */
import pkg from "pg";

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

const pool =
  process.env.NODE_ENV === "test" ? new pkg.Pool(testConfig) : new pkg.Pool();

export default pool;
