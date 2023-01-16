import pool from "#Infrastructures/database/postgres/pool";
import container from "#Infrastructures/container";
import createServer from "#Infrastructures/http/createServer";
import AuthTokenManager from "#Applications/security/AuthTokenManager";
import AuthTableTestHelper from "#TestHelper/AuthTableTestHelper";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";
import ServerTestHelper from "#TestHelper/ServerTestHelper";

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const server = await createServer({});
    // Action
    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });
    // Assert
    expect(response.statusCode).toEqual(404);
  });

  describe("/ endpoint", () => {
    describe("when GET /", () => {
      it("should recevie home route message successfully", async () => {
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "GET",
          url: "/",
        });

        const { status, message } = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toEqual(200);
        expect(status).toEqual("success");
        expect(message).toEqual("Forum API dicoding is running successfully");
      });
    });
  });

  describe("/users endpoint", () => {
    describe("when POST /users", () => {
      it("should response 201 and persisted user", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.addedUser).toBeDefined();
      });

      it("should response 400 when request payload not contain needed property", async () => {
        // Arrange
        const requestPayload = {
          fullname: "Dicoding Indonesia",
          password: "secret",
        };
        const server = await createServer(container);
        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
        );
      });

      it("should response 400 when request payload not meet data type specification", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
          password: "secret",
          fullname: ["Dicoding Indonesia"],
        };
        const server = await createServer(container);
        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "tidak dapat membuat user baru karena tipe data tidak sesuai"
        );
      });

      it("should response 400 when username more than 50 character", async () => {
        // Arrange
        const requestPayload = {
          username:
            "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        };
        const server = await createServer(container);
        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "tidak dapat membuat user baru karena karakter username melebihi batas limit"
        );
      });

      it("should response 400 when username contain restricted character", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding indonesia",
          password: "secret",
          fullname: "Dicoding Indonesia",
        };
        const server = await createServer(container);
        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "tidak dapat membuat user baru karena username mengandung karakter terlarang"
        );
      });

      it("should response 400 when username unavailable", async () => {
        // Arrange
        await UsersTableTestHelper.addUser({ username: "dicoding" });
        const requestPayload = {
          username: "dicoding",
          fullname: "Dicoding Indonesia",
          password: "super_secret",
        };
        const server = await createServer(container);
        // Action
        const response = await server.inject({
          method: "POST",
          url: "/users",
          payload: requestPayload,
        });
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("username tidak tersedia");
      });
    });
  });

  describe("/authentications endpoint", () => {
    describe("when POST /authentications", () => {
      it("should response 201 and new authentication", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
          password: "secret",
        };
        const server = await createServer(container);
        // add user
        await server.inject({
          method: "POST",
          url: "/users",
          payload: {
            username: "dicoding",
            password: "secret",
            fullname: "Dicoding Indonesia",
          },
        });

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.accessToken).toBeDefined();
        expect(responseJson.data.refreshToken).toBeDefined();
      });

      it("should response 400 if username not found", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
          password: "secret",
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("username tidak ditemukan");
      });

      it("should response 401 if password wrong", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
          password: "wrong_password",
        };
        const server = await createServer(container);
        // Add user
        await server.inject({
          method: "POST",
          url: "/users",
          payload: {
            username: "dicoding",
            password: "secret",
            fullname: "Dicoding Indonesia",
          },
        });

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "kredensial yang Anda masukkan salah"
        );
      });

      it("should response 400 if login payload not contain needed property", async () => {
        // Arrange
        const requestPayload = {
          username: "dicoding",
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "harus mengirimkan username dan password"
        );
      });

      it("should response 400 if login payload wrong data type", async () => {
        // Arrange
        const requestPayload = {
          username: 123,
          password: "secret",
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "username dan password harus string"
        );
      });
    });

    describe("when PUT /authentications", () => {
      it("should return 200 and new access token", async () => {
        // Arrange
        const server = await createServer(container);
        // add user
        await server.inject({
          method: "POST",
          url: "/users",
          payload: {
            username: "dicoding",
            password: "secret",
            fullname: "Dicoding Indonesia",
          },
        });
        // login user
        const loginResponse = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: {
            username: "dicoding",
            password: "secret",
          },
        });
        const {
          data: { refreshToken },
        } = JSON.parse(loginResponse.payload);

        // Action
        const response = await server.inject({
          method: "PUT",
          url: "/authentications",
          payload: {
            refreshToken,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
        expect(responseJson.data.accessToken).toBeDefined();
      });

      it("should return 400 payload not contain refresh token", async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "PUT",
          url: "/authentications",
          payload: {},
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("harus mengirimkan token refresh");
      });

      it("should return 400 if refresh token not string", async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "PUT",
          url: "/authentications",
          payload: {
            refreshToken: 123,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("refresh token harus string");
      });

      it("should return 400 if refresh token not valid", async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "PUT",
          url: "/authentications",
          payload: {
            refreshToken: "invalid_refresh_token",
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("refresh token tidak valid");
      });

      it("should return 400 if refresh token not registered in database", async () => {
        // Arrange
        const server = await createServer(container);
        const refreshToken = await container
          .getInstance(AuthTokenManager.name)
          .createRefreshToken({ username: "dicoding" });

        // Action
        const response = await server.inject({
          method: "PUT",
          url: "/authentications",
          payload: {
            refreshToken,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "refresh token tidak ditemukan di database"
        );
      });
    });

    describe("when DELETE /authentications", () => {
      it("should response 200 if refresh token valid", async () => {
        // Arrange
        const server = await createServer(container);
        const refreshToken = "refresh_token";
        await AuthTableTestHelper.addToken(refreshToken);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: "/authentications",
          payload: {
            refreshToken,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual("success");
      });

      it("should response 400 if refresh token not registered in database", async () => {
        // Arrange
        const server = await createServer(container);
        const refreshToken = "refresh_token";

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: "/authentications",
          payload: {
            refreshToken,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual(
          "refresh token tidak ditemukan di database"
        );
      });

      it("should response 400 if payload not contain refresh token", async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: "/authentications",
          payload: {},
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("harus mengirimkan token refresh");
      });

      it("should response 400 if refresh token not string", async () => {
        // Arrange
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: "DELETE",
          url: "/authentications",
          payload: {
            refreshToken: 123,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual("fail");
        expect(responseJson.message).toEqual("refresh token harus string");
      });
    });
  });

  describe("/threads endpoint", () => {
    describe("When POST /threads", () => {
      it("should response success and get added thread information", async () => {
        // Arrange
        const requestPayload = {
          title: "new title thread",
          body: "new body thread",
        };
        const server = await createServer(container);
        // Get access token
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, data } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(201);
        expect(status).toEqual("success");
        expect(data).toBeInstanceOf(Object);
        expect(data.addedThread).toBeInstanceOf(Object);
        expect(data.addedThread.id).toBeDefined();
        expect(data.addedThread.title).toBeDefined();
        expect(data.addedThread.owner).toBeDefined();
      });
      it("should throw error when not contain auth permission", async () => {
        // Arrange
        const requestPayload = {
          title: "new title thread",
          body: "new body thread",
        };
        const server = await createServer(container);
        // Get access token

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          payload: requestPayload,
        });

        // Assert
        const { message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(401);
        expect(message).toEqual("Missing authentication");
      });
      it("should throw error when not contain needed property", async () => {
        // Arrange
        const requestPayload = {
          title: "new title thread",
        };
        const server = await createServer(container);
        // Get access token
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "Need payload contain title and body of thread"
        );
      });
      it("should throw error when not meet data type spesifications", async () => {
        // Arrange
        const requestPayload = {
          title: "new title thread",
          body: 123456,
        };
        const server = await createServer(container);
        // Get access token
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // Action
        const addThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: requestPayload,
        });

        // Assert
        const { status, message } = JSON.parse(addThreadResponse.payload);
        expect(addThreadResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "Need payload contain title as string and body as string"
        );
      });
    });
    describe("when POST /threads/{threadId}/comments", () => {
      it("should succedd to add comment on thread and returning added comment information", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        //Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
      });
      it("should throw missing authentication when not contain auth permission", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          payload: addCommentPayload,
        });
        const { message: addedCommentResponseMessage } = JSON.parse(
          addedCommentResponse.payload
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(401);
        expect(addedCommentResponseMessage).toEqual("Missing authentication");
      });
      it("should throw not found error when thread is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {
          content: `new comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/thread-12346/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(404);
        expect(status).toEqual("fail");
        expect(message).toEqual("Thread is not exist");
      });
      it("should throw error when not contain needed property", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = {};
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual("Need payload contain content of comment");
      });
      it("should throw error when not meet data type specification", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // Action
        // add comment
        const addCommentPayload = { content: 12345 };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const { status, message } = JSON.parse(addedCommentResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual(
          "Need payload contain comment content as string"
        );
      });
    });
    describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
      it("should succedd to add reply on comment and returning added reply information", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(addedReply).toBeInstanceOf(Object);
        expect(addedReply.id).toBeDefined();
        expect(addedReply.content).toBeDefined();
        expect(addedReply.content).toEqual(addReplyPayload.content);
        expect(addedReply.owner).toBeDefined();
      });
      it("should throw missing authentication when not contain auth permission", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          payload: addReplyPayload,
        });
        const { message: addedReplyResponseMessage } = JSON.parse(
          addedReplyResponse.payload
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(401);
        expect(addedReplyResponseMessage).toEqual("Missing authentication");
      });
      it("should throw not found error when comment is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        // add reply
        const addReplyPayload = {
          content: `new reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/comment-12346/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const { status, message } = JSON.parse(addedReplyResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(404);
        expect(status).toEqual("fail");
        expect(message).toEqual("Comment is not exist");
      });
      it("should throw error when not contain needed property", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        // add reply
        const addReplyPayload = {};
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const { status, message } = JSON.parse(addedReplyResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual("Need payload contain content of reply");
      });
      it("should throw error when not meet data type specification", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        // add reply
        const addReplyPayload = { content: 12345 };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const { status, message } = JSON.parse(addedReplyResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(400);
        expect(status).toEqual("fail");
        expect(message).toEqual("Need payload contain reply content as string");
      });
    });
    describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
      it("should success deleting comment", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        const commentsBeforeDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // delete comment
        const deleteCommentResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { status: deleteCommentResponseStatus } = JSON.parse(
          deleteCommentResponse.payload
        );
        const commentsAfterDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(deleteCommentResponse.statusCode).toEqual(200);
        expect(deleteCommentResponseStatus).toEqual("success");
        expect(commentsBeforeDelete).toHaveLength(1);
        expect(commentsBeforeDelete[0].is_deleted).toEqual(false);
        expect(commentsAfterDelete).toHaveLength(1);
        expect(commentsAfterDelete[0].is_deleted).toEqual(true);
      });
      it("should throw not found error when comment is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        const commentsBeforeDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // delete comment
        const deleteCommentResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/xxx`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const {
          status: deleteCommentResponseStatus,
          message: deleteCommentResponseMessage,
        } = JSON.parse(deleteCommentResponse.payload);
        const commentsAfterDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(deleteCommentResponse.statusCode).toEqual(404);
        expect(deleteCommentResponseStatus).toEqual("fail");
        expect(deleteCommentResponseMessage).toEqual("Comment is not exist");
        expect(commentsBeforeDelete).toHaveLength(1);
        expect(commentsBeforeDelete[0].is_deleted).toEqual(false);
        expect(commentsAfterDelete).toHaveLength(1);
        expect(commentsAfterDelete[0].is_deleted).toEqual(false);
      });
      it("should throw authorization error when failed to verify comment owner", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // Action
        const otherAccessToken = await ServerTestHelper.getAccessToken(server, {
          username: "otherdicoding",
          password: "othersecretpassword",
          fullname: "Dicoding Jakarta",
        });
        const commentsBeforeDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // delete comment
        const deleteCommentResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
          headers: {
            Authorization: `Bearer ${otherAccessToken}`,
          },
        });
        const {
          status: deleteCommentResponseStatus,
          message: deleteCommentResponseMessage,
        } = JSON.parse(deleteCommentResponse.payload);
        const commentsAfterDelete =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(deleteCommentResponse.statusCode).toEqual(403);
        expect(deleteCommentResponseStatus).toEqual("fail");
        expect(deleteCommentResponseMessage).toEqual("Not Authorized");
        expect(commentsBeforeDelete).toHaveLength(1);
        expect(commentsBeforeDelete[0].is_deleted).toEqual(false);
        expect(commentsAfterDelete).toHaveLength(1);
        expect(commentsAfterDelete[0].is_deleted).toEqual(false);
      });
    });
    describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
      it("should succeed delete reply on comment", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        // Action
        const replyBeforeDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );
        const deleteReplyResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { status: deleteReplyResponseStatus } = JSON.parse(
          deleteReplyResponse.payload
        );
        const replyAfterDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(deleteReplyResponse.statusCode).toEqual(200);
        expect(deleteReplyResponseStatus).toEqual("success");
        expect(replyBeforeDelete).toHaveLength(1);
        expect(replyBeforeDelete[0].is_deleted).toEqual(false);
        expect(replyAfterDelete).toHaveLength(1);
        expect(replyAfterDelete[0].is_deleted).toEqual(true);
      });
      it("should throw notFound error when replies is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        // Action
        const replyBeforeDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );
        const deleteReplyResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/xxx`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const {
          status: deleteReplyResponseStatus,
          message: deleteReplyResponseMessage,
        } = JSON.parse(deleteReplyResponse.payload);
        const replyAfterDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(deleteReplyResponse.statusCode).toEqual(404);
        expect(deleteReplyResponseStatus).toEqual("fail");
        expect(deleteReplyResponseMessage).toEqual("Comment is not exist");
        expect(replyBeforeDelete).toHaveLength(1);
        expect(replyBeforeDelete[0].is_deleted).toEqual(false);
        expect(replyAfterDelete).toHaveLength(1);
        expect(replyAfterDelete[0].is_deleted).toEqual(false);
      });
      it("should throw authorization error when failed to verify reply owner", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        // Action
        const otherAccessToken = await ServerTestHelper.getAccessToken(server, {
          username: "otherdicoding",
          password: "othersecretpassword",
          fullname: "Dicoding Jakarta",
        });
        const replyBeforeDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );
        const deleteReplyResponse = await server.inject({
          method: "DELETE",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
          headers: {
            Authorization: `Bearer ${otherAccessToken}`,
          },
        });
        const {
          status: deleteReplyResponseStatus,
          message: deleteReplyResponseMessage,
        } = JSON.parse(deleteReplyResponse.payload);
        const replyAfterDelete = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(deleteReplyResponse.statusCode).toEqual(403);
        expect(deleteReplyResponseStatus).toEqual("fail");
        expect(deleteReplyResponseMessage).toEqual("Not Authorized");
        expect(replyBeforeDelete).toHaveLength(1);
        expect(replyBeforeDelete[0].is_deleted).toEqual(false);
        expect(replyAfterDelete).toHaveLength(1);
        expect(replyAfterDelete[0].is_deleted).toEqual(false);
      });
    });
    describe("when GET /threads/{threadId}", () => {
      it("should get thread details successfully (with token)", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        const [getThread] = await ThreadsTableTestHelper.findThreadById(
          addedThread.id
        );
        const [getComment] = await ThreadsTableTestHelper.findCommentById(
          addedComment.id
        );
        const [getReply] = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );

        const expectedThreadDetails = {
          id: getThread.id,
          username: "dicoding",
          title: getThread.title,
          body: getThread.body,
          date: getThread.created_at.toISOString(),
          is_deleted: getThread.is_deleted,
          comments: [
            {
              id: getComment.id,
              username: "dicoding",
              content: getComment.content,
              date: getComment.created_at.toISOString(),
              likeCount: getComment.likes,
              replies: [
                {
                  id: getReply.id,
                  username: "dicoding",
                  content: getReply.content,
                  date: getReply.created_at.toISOString(),
                  likeCount: getReply.likes,
                },
              ],
            },
          ],
        };

        // Action
        const threadDetailsResponse = await server.inject({
          method: "GET",
          url: `/threads/${addedThread.id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const {
          status: threadDetailsResponseStatus,
          data: { thread },
        } = JSON.parse(threadDetailsResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(threadDetailsResponse.statusCode).toEqual(200);
        expect(threadDetailsResponseStatus).toEqual("success");
        expect(thread).toStrictEqual(expectedThreadDetails);
      });
      it("should get thread details successfully (without token)", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const {
          status: addedReplyResponseStatus,
          data: { addedReply },
        } = JSON.parse(addedReplyResponse.payload);

        const [getThread] = await ThreadsTableTestHelper.findThreadById(
          addedThread.id
        );
        const [getComment] = await ThreadsTableTestHelper.findCommentById(
          addedComment.id
        );
        const [getReply] = await ThreadsTableTestHelper.findCommentById(
          addedReply.id
        );

        const expectedThreadDetails = {
          id: getThread.id,
          username: "dicoding",
          title: getThread.title,
          body: getThread.body,
          date: getThread.created_at.toISOString(),
          is_deleted: getThread.is_deleted,
          comments: [
            {
              id: getComment.id,
              username: "dicoding",
              content: getComment.content,
              date: getComment.created_at.toISOString(),
              likeCount: getComment.likes,
              replies: [
                {
                  id: getReply.id,
                  username: "dicoding",
                  content: getReply.content,
                  date: getReply.created_at.toISOString(),
                  likeCount: getReply.likes,
                },
              ],
            },
          ],
        };

        // Action
        const threadDetailsResponse = await server.inject({
          method: "GET",
          url: `/threads/${addedThread.id}`,
        });
        const {
          status: threadDetailsResponseStatus,
          data: { thread },
        } = JSON.parse(threadDetailsResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(threadDetailsResponse.statusCode).toEqual(200);
        expect(threadDetailsResponseStatus).toEqual("success");
        expect(thread).toStrictEqual(expectedThreadDetails);
      });
      it("should throw not found error when thread is not found (with token)", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const { status: addedReplyResponseStatus } = JSON.parse(
          addedReplyResponse.payload
        );

        // Action
        const threadDetailsResponse = await server.inject({
          method: "GET",
          url: `/threads/thread-56789`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const {
          status: threadDetailsResponseStatus,
          message: threadDetailsResponseMessage,
        } = JSON.parse(threadDetailsResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(threadDetailsResponse.statusCode).toEqual(404);
        expect(threadDetailsResponseStatus).toEqual("fail");
        expect(threadDetailsResponseMessage).toEqual(
          "Failed to get thread details. Thread not found"
        );
      });
      it("should throw not found error when thread is not found (withouth token)", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);

        // add reply
        const addReplyPayload = {
          content: `New reply on comment ${addedComment.id}`,
        };
        const addedReplyResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addReplyPayload,
        });
        const { status: addedReplyResponseStatus } = JSON.parse(
          addedReplyResponse.payload
        );

        // Action
        const threadDetailsResponse = await server.inject({
          method: "GET",
          url: `/threads/thread-56789`,
        });
        const {
          status: threadDetailsResponseStatus,
          message: threadDetailsResponseMessage,
        } = JSON.parse(threadDetailsResponse.payload);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedReplyResponse.statusCode).toEqual(201);
        expect(addedReplyResponseStatus).toEqual("success");
        expect(threadDetailsResponse.statusCode).toEqual(404);
        expect(threadDetailsResponseStatus).toEqual("fail");
        expect(threadDetailsResponseMessage).toEqual(
          "Failed to get thread details. Thread not found"
        );
      });
    });
    describe("when UPDATE /threads/{threadId}/comments/{commentId}/likes", () => {
      it("should increase likes on comment successfully", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);
        const commentBeforeAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Action
        const addCommentLikesResponse = await server.inject({
          method: "PUT",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { status: addCommentLikesResponseStatus } = JSON.parse(
          addCommentLikesResponse.payload
        );
        const commentAfterAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
        expect(addCommentLikesResponse.statusCode).toEqual(200);
        expect(addCommentLikesResponseStatus).toEqual("success");
        expect(commentBeforeAddLikes).toHaveLength(1);
        expect(commentBeforeAddLikes[0].likes).toEqual(0);
        expect(commentAfterAddLikes).toHaveLength(1);
        expect(commentAfterAddLikes[0].likes).toEqual(1);
      });
      it("should decrease likes on comment successfully", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);
        const commentBeforeAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Action
        // add likes
        const addCommentLikesResponse = await server.inject({
          method: "PUT",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { status: addCommentLikesResponseStatus } = JSON.parse(
          addCommentLikesResponse.payload
        );
        const commentAfterAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // delete likes
        const deleteCommentLikesResponse = await server.inject({
          method: "PUT",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { status: deleteCommentLikesResponseStatus } = JSON.parse(
          deleteCommentLikesResponse.payload
        );
        const commentAfterDeleteLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
        expect(addCommentLikesResponse.statusCode).toEqual(200);
        expect(addCommentLikesResponseStatus).toEqual("success");
        expect(commentBeforeAddLikes).toHaveLength(1);
        expect(commentBeforeAddLikes[0].likes).toEqual(0);
        expect(commentAfterAddLikes).toHaveLength(1);
        expect(commentAfterAddLikes[0].likes).toEqual(1);
        expect(commentAfterDeleteLikes).toHaveLength(1);
        expect(commentAfterDeleteLikes[0].likes).toEqual(0);
      });
      it("should throw missing authentication when not contain auth permission", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);
        const commentBeforeAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Action
        const addCommentLikesResponse = await server.inject({
          method: "PUT",
          url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        });
        const { message: addCommentLikesMessage } = JSON.parse(
          addCommentLikesResponse.payload
        );
        const commentAfterAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
        expect(addCommentLikesResponse.statusCode).toEqual(401);
        expect(addCommentLikesMessage).toEqual("Missing authentication");
        expect(commentBeforeAddLikes).toHaveLength(1);
        expect(commentBeforeAddLikes[0].likes).toEqual(0);
        expect(commentAfterAddLikes).toHaveLength(1);
        expect(commentAfterAddLikes[0].likes).toEqual(0);
      });
      it("throw NotFound error when comment is not exist", async () => {
        // Arrange
        const server = await createServer(container);
        const accessToken = await ServerTestHelper.getAccessToken(server);

        // add thread
        const addThreadPayload = {
          title: "New thread title",
          body: "New thread body",
        };
        const addedThreadResponse = await server.inject({
          method: "POST",
          url: "/threads",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addThreadPayload,
        });
        const {
          status: addedThreadResponseStatus,
          data: { addedThread },
        } = JSON.parse(addedThreadResponse.payload);

        // add comment
        const addCommentPayload = {
          content: `New comment on thread ${addedThread.id}`,
        };
        const addedCommentResponse = await server.inject({
          method: "POST",
          url: `/threads/${addedThread.id}/comments`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          payload: addCommentPayload,
        });
        const {
          status: addedCommentResponseStatus,
          data: { addedComment },
        } = JSON.parse(addedCommentResponse.payload);
        const commentBeforeAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Action
        const addCommentLikesResponse = await server.inject({
          method: "PUT",
          url: `/threads/${addedThread.id}/comments/xxxx/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const {
          status: addCommentLikesResponseStatus,
          message: addCommentLikesMessage,
        } = JSON.parse(addCommentLikesResponse.payload);
        const commentAfterAddLikes =
          await ThreadsTableTestHelper.findCommentById(addedComment.id);

        // Assert
        expect(addedThreadResponse.statusCode).toEqual(201);
        expect(addedThreadResponseStatus).toEqual("success");
        expect(addedCommentResponse.statusCode).toEqual(201);
        expect(addedCommentResponseStatus).toEqual("success");
        expect(addedComment).toBeInstanceOf(Object);
        expect(addedComment.id).toBeDefined();
        expect(addedComment.content).toBeDefined();
        expect(addedComment.content).toEqual(addCommentPayload.content);
        expect(addedComment.owner).toBeDefined();
        expect(addCommentLikesResponse.statusCode).toEqual(404);
        expect(addCommentLikesResponseStatus).toEqual("fail");
        expect(addCommentLikesMessage).toEqual("Comment is not exist");
        expect(commentBeforeAddLikes).toHaveLength(1);
        expect(commentBeforeAddLikes[0].likes).toEqual(0);
        expect(commentAfterAddLikes).toHaveLength(1);
        expect(commentAfterAddLikes[0].likes).toEqual(0);
      });
    });
  });

  it("should handle server error correctly", async () => {
    // Arrange
    const requestPayload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "super_secret",
    };
    const server = await createServer({}); // fake container
    // Action
    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: requestPayload,
    });
    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual("error");
    expect(responseJson.message).toEqual("terjadi kegagalan pada server kami");
  });
});
