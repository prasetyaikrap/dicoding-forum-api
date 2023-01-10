export default class GetThreadDetails {
  constructor(queryResult) {
    this.queryResult = queryResult;
    this.thread = this._getThread(queryResult);
  }

  _getThread(queryResult) {
    const comments = this._getComments(queryResult);
    const thread = {
      id: queryResult[0].t_id,
      username: queryResult[0].ut_username,
      title: queryResult[0].t_title,
      body: queryResult[0].t_body,
      date: queryResult[0].t_date,
      is_deleted: queryResult[0].t_is_deleted,
      comments: [...comments],
    };
    return thread;
  }

  _getComments(queryResult) {
    // Populate Comments and Replies
    const comments = queryResult
      .filter((comment) => !comment.tc_reply_comment_id)
      .map((comment) => {
        // get replies
        const replies = this._getReplies(queryResult, comment.tc_id);
        // returning comment object
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
    return comments;
  }

  _getReplies(queryResult, commentId) {
    //Filter data to get replies and mapped it into replies object
    const replies = queryResult
      .filter((reply) => {
        return reply.tc_reply_comment_id === commentId;
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
    return replies;
  }
}
