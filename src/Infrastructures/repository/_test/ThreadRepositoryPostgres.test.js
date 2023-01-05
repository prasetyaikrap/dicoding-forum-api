import RegisterUser from "#Domains/users/entities/RegisterUser";
import pool from "#Infrastructures/database/postgres/pool";
import ThreadRepositoryPostgres from "#Infrastructures/repository/ThreadRepositoryPostgres";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";
import UserRepositoryPostgres from "#Infrastructures/repository/UserRepositoryPostgres";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import InvariantError from "#Commons/exceptions/InvariantError";
import NotFoundError from "#Commons/exceptions/NotFoundError";

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
});
