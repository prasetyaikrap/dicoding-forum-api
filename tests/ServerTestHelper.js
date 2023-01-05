/* istanbul ignore file */

const ServerTestHelper = {
  async getAccessToken(server) {
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
    return accessToken;
  },
};

export default ServerTestHelper;
