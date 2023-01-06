import RegisterUser from "#Domains/users/entities/RegisterUser";
import pool from "#Infrastructures/database/postgres/pool";
import ThreadRepositoryPostgres from "#Infrastructures/repository/ThreadRepositoryPostgres";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";
import UserRepositoryPostgres from "#Infrastructures/repository/UserRepositoryPostgres";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import NotFoundError from "#Commons/exceptions/NotFoundError";
import AuthorizationError from "#Commons/exceptions/AuthorizationError";

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

  describe("addCommentOnThread function", () => {
    it("Should persist new comment data", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      const addedComment = await threadRepositoryPostgres.addCommentOnThread(
        addComment
      );
      const comments = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      //Assert
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual({
        id: "comment-12345",
        content: addComment.content,
        owner: addComment.ownerId,
      });
    });
  });

  describe("deleteCommentOnThread function", () => {
    it("should delete target comment from database", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };
      await threadRepositoryPostgres.addCommentOnThread(addComment);
      const commentsBeforeDelete = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      // delete comment
      const deleteComment = {
        ownerId: addComment.ownerId,
        threadId: addComment.threadId,
        commentId: "comment-12345",
      };
      await threadRepositoryPostgres.deleteCommentOnThread(deleteComment);
      const commentsAfterDelete = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      //Assert
      expect(commentsBeforeDelete).toHaveLength(1);
      expect(commentsBeforeDelete[0].is_deleted).toEqual(false);
      expect(commentsAfterDelete).toHaveLength(1);
      expect(commentsAfterDelete[0].is_deleted).toEqual(true);
    });

    it("should throw Not Found Error when comment is not exist", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await threadRepositoryPostgres.addCommentOnThread(addComment);
      const comments = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      // delete not exist comment
      const deleteComment = {
        ownerId: addComment.ownerId,
        threadId: addComment.threadId,
        commentId: "comment-56789",
      };

      //Assert
      expect(comments).toHaveLength(1);
      await expect(
        threadRepositoryPostgres.deleteCommentOnThread(deleteComment)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("addReplyOnComment function", () => {
    it("Should persist new comment data", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // add reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      const addedReply = await threadRepositoryPostgres.addReplyOnComment(
        addReply
      );
      const replies = await ThreadsTableTestHelper.findCommentById(
        "reply-12345"
      );

      //Assert
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual({
        id: "reply-12345",
        content: addReply.content,
        owner: addReply.ownerId,
      });
    });
  });

  describe("deleteReplyOnComment function", () => {
    it("should delete target reply from database", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };
      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // add Reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      await threadRepositoryPostgres.addReplyOnComment(addReply);

      const repliesBeforeDelete = await ThreadsTableTestHelper.findCommentById(
        "reply-12345"
      );

      // delete reply
      const deleteReply = {
        ownerId: addReply.ownerId,
        threadId: addReply.threadId,
        commentId: "reply-12345",
        replyCommentId: addReply.replyCommentId,
      };
      await threadRepositoryPostgres.deleteReplyOnComment(deleteReply);
      const repliesAfterDelete = await ThreadsTableTestHelper.findCommentById(
        "reply-12345"
      );

      //Assert
      expect(repliesBeforeDelete).toHaveLength(1);
      expect(repliesBeforeDelete[0].is_deleted).toEqual(false);
      expect(repliesAfterDelete).toHaveLength(1);
      expect(repliesAfterDelete[0].is_deleted).toEqual(true);
    });

    it("should throw Not Found Error when reply is not exist", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };
      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // add Reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      await threadRepositoryPostgres.addReplyOnComment(addReply);

      const replies = await ThreadsTableTestHelper.findCommentById(
        "reply-12345"
      );

      // delete reply
      const deleteReply = {
        ownerId: addReply.ownerId,
        threadId: addReply.threadId,
        commentId: "reply-56789",
        replyCommentId: addReply.replyCommentId,
      };

      //Assert
      expect(replies).toHaveLength(1);
      await expect(
        threadRepositoryPostgres.deleteReplyOnComment(deleteReply)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should not throw authorization error when comment owner is verified", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };
      await threadRepositoryPostgres.addCommentOnThread(addComment);
      const comments = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      // verify comment owner
      const verifyCommentOwner = {
        threadId: addComment.threadId,
        commentId: "comment-12345",
        ownerId: addComment.ownerId,
      };

      // Action & Assert
      expect(comments).toHaveLength(1);
      await expect(
        threadRepositoryPostgres.verifyCommentOwner(verifyCommentOwner)
      ).resolves.not.toThrow(AuthorizationError);
    });

    it("should throw authorization error when failed to verify comment owner", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };
      await threadRepositoryPostgres.addCommentOnThread(addComment);
      const comments = await ThreadsTableTestHelper.findCommentById(
        "comment-12345"
      );

      // verify comment owner
      const verifyCommentOwner = {
        threadId: addComment.threadId,
        commentId: "comment-12345",
        ownerId: "user-56789",
      };

      // Action & Assert
      expect(comments).toHaveLength(1);
      await expect(() =>
        threadRepositoryPostgres.verifyCommentOwner(verifyCommentOwner)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("verifyThreadExistence function", () => {
    it("should verify thread existence correctly", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExistence({
          threadId: "thread-12345",
        })
      ).resolves.not.toThrow(NotFoundError);
    });
    it("should throw not found error when thread is not exist", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // Action & Assert
      await expect(() =>
        threadRepositoryPostgres.verifyThreadExistence({
          threadId: "thread-12346",
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("verifyCommentExistence function", () => {
    it("should verify thread existence correctly", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyCommentExistence({
          threadId: "thread-12345",
          commentId: "comment-12345",
        })
      ).resolves.not.toThrow(NotFoundError);
    });
    it("should throw not found error when thread is not exist", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // Action & Assert
      await expect(() =>
        threadRepositoryPostgres.verifyCommentExistence({
          threadId: "thread-12346",
          commentId: "comment-12345",
        })
      ).rejects.toThrow(NotFoundError);
    });
    it("should throw not found error when comment is not exist", async () => {
      // Arrange
      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      // add thread
      const addThread = {
        ownerId: "user-12345",
        title: "new test title",
        body: "new test body",
      };
      await threadRepositoryPostgres.addNewThread(addThread);

      // add comment
      const addComment = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        content: "new comment on thread thread-12345 #1",
      };

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // Action & Assert
      await expect(() =>
        threadRepositoryPostgres.verifyCommentExistence({
          threadId: "thread-12345",
          commentId: "comment-12346",
        })
      ).rejects.toThrow(NotFoundError);
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

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // add reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      await threadRepositoryPostgres.addReplyOnComment(addReply);
      const expectedThreadDetailsObject = {
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
            content: "new comment on thread thread-12345 #1",
            date: "2023-5-1",
            replies: [
              {
                id: "reply-12345",
                username: "dicoding",
                content: "new reply on comment comment-12345 #1",
                date: "2023-5-1",
              },
            ],
          },
        ],
      };

      // Action
      const { queryResult, thread } =
        await threadRepositoryPostgres.getThreadById("thread-12345");

      // inject data to expectedThreadDetailsObject
      expectedThreadDetailsObject.date = thread.date;
      expectedThreadDetailsObject.comments[0].date = thread.comments[0].date;
      expectedThreadDetailsObject.comments[0].replies[0].date =
        thread.comments[0].replies[0].date;

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

      await threadRepositoryPostgres.addCommentOnThread(addComment);

      // add reply
      const addReply = {
        ownerId: "user-12345",
        threadId: "thread-12345",
        replyCommentId: "comment-12345",
        content: "new reply on comment comment-12345 #1",
      };
      await threadRepositoryPostgres.addReplyOnComment(addReply);

      // Action & Assert
      await expect(() =>
        threadRepositoryPostgres.getThreadById("thread-12346")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
