/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("thread_comments", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
      unique: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    thread_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "threads",
      onDelete: "CASCADE",
    },
    reply_comment_id: {
      type: "VARCHAR(50)",
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("thread_comments");
};
