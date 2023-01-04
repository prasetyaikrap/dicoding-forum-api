import pool from "#Infrastructures/database/postgres/pool";
import container from "#Infrastructures/container";
import createServer from "#Infrastructures/http/createServer";
import AuthTokenManager from "#Applications/security/AuthTokenManager";
import AuthTableTestHelper from "#TestHelper/AuthTableTestHelper";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";

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
      it("should response success and get thread short detail", async () => {
        // Arrange
        const requestPayload = {
          title: "new title thread",
          body: "new body thread",
        };
        const server = await createServer(container);
        // Add new user
        await server.inject({
          method: "POST",
          url: "/users",
          payload: {
            username: "dicoding",
            password: "secretPassword",
            fullname: "Dicoding Indonesia",
          },
        });
        // getAccessToken
        const authResponse = await server.inject({
          method: "POST",
          url: "/authentications",
          payload: {
            username: "dicoding",
            password: "secretPassword",
          },
        });

        const {
          data: { accessToken },
        } = JSON.parse(authResponse.payload);

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
