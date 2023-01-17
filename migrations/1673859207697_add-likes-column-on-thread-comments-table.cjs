/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumns(
    "thread_comments",
    {
      likes: {
        type: "INT",
        default: 0,
        notNull: true,
      },
    },
    {
      ifExist: true,
    }
  );
};
