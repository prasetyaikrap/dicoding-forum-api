export default class GetThreadDetails {
  constructor(queryResult) {
    this.queryResult = queryResult;
    this.thread = this._resultMapping(queryResult);
  }

  _resultMapping(queryResult) {
    // Populate Comments and Replies
    const threadComments = queryResult
      .filter((comment) => !comment.tc_reply_comment_id)
      .map((comment) => {
        //Filter data to get replies and mapped it into replies object
        const replies = queryResult
          .filter((reply) => {
            return reply.tc_reply_comment_id === comment.tc_id;
          })
          .map((reply) => {
            return {
              id: reply.tc_id,
              username: reply.utc_username,
              content: reply.tc_is_deleted
                ? "**balasan telah dihapus**"
                : reply.tc_content,
              date: reply.tc_date,
            };
          });

        //returning comment object
        return {
          id: comment.tc_id,
          username: comment.utc_username,
          content: comment.tc_is_deleted
            ? "**komentar telah dihapus**"
            : comment.tc_content,
          date: comment.tc_date,
          replies: [...replies],
        };
      });

    // thread object
    return {
      id: queryResult[0].t_id,
      username: queryResult[0].ut_username,
      title: queryResult[0].t_title,
      body: queryResult[0].t_body,
      date: queryResult[0].t_date,
      is_deleted: queryResult[0].t_is_deleted,
      comments: [...threadComments],
    };
  }
}
