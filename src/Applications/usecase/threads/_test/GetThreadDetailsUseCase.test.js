import GetThreadDetailsUseCase from "#Applications/usecase/threads/GetThreadDetailsUseCase";
import GetThreadDetails from "#Domains/threads/entities/GetThreadDetails";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
import { jest } from "@jest/globals";

describe("GetThreadDetailsUseCase", () => {
  it("should orchestrate get thread details correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-12345",
    };
    const expectedQueryResult = [
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
    const expectedThreadDetails = {
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

    //mock
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new GetThreadDetails(expectedQueryResult))
      );
    const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const { queryResult, thread } = await getThreadDetailsUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      "thread-12345"
    );
    expect(queryResult).toHaveLength(4);
    expect(thread).toStrictEqual(expectedThreadDetails);
  });
});
