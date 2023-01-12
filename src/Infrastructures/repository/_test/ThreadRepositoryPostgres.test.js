import RegisterUser from "#Domains/users/entities/RegisterUser";
import pool from "#Infrastructures/database/postgres/pool";
import ThreadRepositoryPostgres from "#Infrastructures/repository/ThreadRepositoryPostgres";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";
import UserRepositoryPostgres from "#Infrastructures/repository/UserRepositoryPostgres";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import CommentsRepositoryPostgress from "#Infrastructures/repository/CommentsRepositoryPostgres";

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    //Register new User
    const registerUser = new RegisterUser({
      username: "dicoding",
      password: "secret_password",
      fullname: "Dicoding Indonesia",
    });
    const fakeIdGenerator = () => "12345";
    const userRepositoryPostgres = new UserRepositoryPostgres(
      pool,
      fakeIdGenerator
    );

    await userRepositoryPostgres.addUser(registerUser);
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addNewThread function", () => {
    it("Should persist thread data", async () => {
      // Arrange
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      const fakeIdGenerator = () => "12345";

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addNewThread(
        addThread
      );
      const threads = await ThreadsTableTestHelper.findThreadById(
        "thread-12345"
      );

      //Assert
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual({
        id: "thread-12345",
        owner: addThread.ownerId,
        title: addThread.title,
      });
    });
  });

  describe("getThreadById function", () => {
    it("should return query result properly", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const commentsRepositoryPostgres = new CommentsRepositoryPostgress(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new thread title",
        body: "new thread body",
      };
      const addedThread = await threadRepositoryPostgres.addNewThread(
        addThread
      );

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      const { addedComment } =
        await commentsRepositoryPostgres.addCommentOnThread(addComment);

      // add reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      const { addedReply } = await commentsRepositoryPostgres.addReplyOnComment(
        addReply
      );

      // Get Thread, comment, and reply date
      const [getThread] = await ThreadsTableTestHelper.findThreadById(
        addedThread.id
      );
      const [getComment] = await ThreadsTableTestHelper.findCommentById(
        addedComment.id
      );
      const [getReply] = await ThreadsTableTestHelper.findCommentById(
        addedReply.id
      );

      const expectedThreadDetailsObject = {
        id: "thread-12345",
        username: "dicoding",
        title: "new thread title",
        body: "new thread body",
        date: getThread.created_at,
        is_deleted: false,
        comments: [
          {
            id: "comment-12345",
            username: "dicoding",
            content: "new comment on thread thread-12345 #1",
            date: getComment.created_at,
            replies: [
              {
                id: "reply-12345",
                username: "dicoding",
                content: "new reply on comment comment-12345 #1",
                date: getReply.created_at,
              },
            ],
          },
        ],
      };

      // Action
      const { queryResult, thread } =
        await threadRepositoryPostgres.getThreadById("thread-12345");

      // Assert
      expect(queryResult).toHaveLength(2);
      expect(thread).toBeInstanceOf(Object);
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread).toStrictEqual(expectedThreadDetailsObject);
    });
    it("should throw Not Found Error when thread is not exist", async () => {
      // Arrange
      let fakeId = 12344;
      const fakeIdGenerator = () => (fakeId + 1).toString();
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const commentsRepositoryPostgres = new CommentsRepositoryPostgress(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new thread title",
        body: "new thread body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await commentsRepositoryPostgres.addCommentOnThread(addComment);

      // add reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      await commentsRepositoryPostgres.addReplyOnComment(addReply);

      // Action & Assert
      await expect(() =>
        threadRepositoryPostgres.getThreadById("thread-12346")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
