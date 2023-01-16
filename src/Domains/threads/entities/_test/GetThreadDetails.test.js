import GetThreadDetails from "#Domains/threads/entities/GetThreadDetails";

describe("GetThreadDetails response entities", () => {
  it("Should create proper thread details object properly", () => {
    // Arrange
    const qResult = [
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "comment-12345",
        tc_content: "new comment on thread #1",
        tc_date: "2023-5-1",
        tc_is_deleted: false,
        tc_reply_comment_id: null,
        tc_likes: 0,
        utc_username: "dicoding",
      },
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "comment-56789",
        tc_content: "new comment on thread #2",
        tc_date: "2023-6-1",
        tc_is_deleted: false,
        tc_reply_comment_id: null,
        tc_likes: 0,
        utc_username: "decoders",
      },
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "reply-12345",
        tc_content: "new reply on comment comment-12345",
        tc_date: "2023-5-1",
        tc_is_deleted: false,
        tc_reply_comment_id: "comment-12345",
        tc_likes: 0,
        utc_username: "decoders",
      },
    ];
    const expectedThreadObject = {
      id: "thread-12345",
      username: "dicoding",
      title: "new thread title",
      body: "new thread body",
      date: "2023-5-1",
      is_deleted: false,
      comments: [
        {
          id: "comment-12345",
          username: "dicoding",
          content: "new comment on thread #1",
          date: "2023-5-1",
          likeCount: 0,
          replies: [
            {
              id: "reply-12345",
              username: "decoders",
              content: "new reply on comment comment-12345",
              date: "2023-5-1",
              likeCount: 0,
            },
          ],
        },
        {
          id: "comment-56789",
          username: "decoders",
          content: "new comment on thread #2",
          date: "2023-6-1",
          likeCount: 0,
          replies: [],
        },
      ],
    };

    // Action
    const { queryResult, thread } = new GetThreadDetails(qResult);

    // Assert
    expect(queryResult).toStrictEqual(qResult);
    expect(thread).toStrictEqual(expectedThreadObject);
  });

  it("Should modify comment content when its get deleted", () => {
    // Arrange
    const qResult = [
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "comment-12345",
        tc_content: "new comment on thread #1",
        tc_date: "2023-5-1",
        tc_is_deleted: false,
        tc_reply_comment_id: null,
        tc_likes: 0,
        utc_username: "dicoding",
      },
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "comment-56789",
        tc_content: "new comment on thread #2",
        tc_date: "2023-6-1",
        tc_is_deleted: true,
        tc_reply_comment_id: null,
        tc_likes: 0,
        utc_username: "decoders",
      },
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "reply-12345",
        tc_content: "new reply on comment comment-12345 #1",
        tc_date: "2023-5-1",
        tc_is_deleted: false,
        tc_reply_comment_id: "comment-12345",
        tc_likes: 0,
        utc_username: "decoders",
      },
      {
        t_id: "thread-12345",
        t_title: "new thread title",
        t_body: "new thread body",
        t_is_deleted: false,
        t_date: "2023-5-1",
        ut_username: "dicoding",
        tc_id: "reply-56789",
        tc_content: "new reply on comment comment-12345 #2",
        tc_date: "2023-6-1",
        tc_is_deleted: true,
        tc_reply_comment_id: "comment-12345",
        tc_likes: 0,
        utc_username: "indodicoding",
      },
    ];
    const expectedThreadObject = {
      id: "thread-12345",
      username: "dicoding",
      title: "new thread title",
      body: "new thread body",
      date: "2023-5-1",
      is_deleted: false,
      comments: [
        {
          id: "comment-12345",
          username: "dicoding",
          content: "new comment on thread #1",
          date: "2023-5-1",
          likeCount: 0,
          replies: [
            {
              id: "reply-12345",
              username: "decoders",
              content: "new reply on comment comment-12345 #1",
              date: "2023-5-1",
              likeCount: 0,
            },
            {
              id: "reply-56789",
              username: "indodicoding",
              content: "**balasan telah dihapus**",
              date: "2023-6-1",
              likeCount: 0,
            },
          ],
        },
        {
          id: "comment-56789",
          username: "decoders",
          content: "**komentar telah dihapus**",
          date: "2023-6-1",
          likeCount: 0,
          replies: [],
        },
      ],
    };

    // Action
    const { queryResult, thread } = new GetThreadDetails(qResult);

    // Assert
    expect(queryResult).toStrictEqual(qResult);
    expect(thread).toStrictEqual(expectedThreadObject);
  });
});
