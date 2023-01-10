import UserAuth from "#Domains/authentications/entities/UserAuth";

describe("User Auth Entities", () => {
  it("Should throw error when not contain needed data", () => {
    // Arrange
    const payload = {
      accessToken: "accessToken",
    };

    // Action & Assert
    expect(() => new UserAuth(payload)).toThrow(
      "USER_AUTH.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when not meet data type spesification", () => {
    // Arrange
    const payload = {
      accessToken: "accessToken",
      refreshToken: 12345,
    };

    // Action & Assert
    expect(() => new UserAuth(payload)).toThrow(
      "USER_AUTH.NOT_MEET_DATA_TYPE_SPESIFICATION"
    );
  });

  it("Should create user auth object correctly", () => {
    // Arrange
    const payload = {
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    };

    // Action
    const userAuth = new UserAuth(payload);

    // Assert
    expect(userAuth.accessToken).toEqual(payload.accessToken);
    expect(userAuth.refreshToken).toEqual(payload.refreshToken);
  });
});
