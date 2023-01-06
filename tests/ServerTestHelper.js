/* istanbul ignore file */

const ServerTestHelper = {
  async getAccessToken(
    server,
    userPayload = {
      username: "dicoding",
      password: "secretPassword",
      fullname: "Dicoding Indonesia",
    }
  ) {
    // Add new user
    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: userPayload.username,
        password: userPayload.password,
        fullname: userPayload.fullname,
      },
    });
    // getAccessToken
    const authResponse = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: userPayload.username,
        password: userPayload.password,
      },
    });

    const {
      data: { accessToken },
    } = JSON.parse(authResponse.payload);
    return accessToken;
  },
};

export default ServerTestHelper;
