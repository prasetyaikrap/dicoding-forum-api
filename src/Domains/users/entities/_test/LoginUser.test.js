import LoginUser from "#Domains/users/entities/LoginUser";

describe("Login User Entities", () => {
  it("Should throw error when not contain needed data", () => {
    // Arrange
    const payload = {
      username: "dicoding",
    };

    // Action & Assert
    expect(() => new LoginUser(payload)).toThrowError(
      "LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("Should throw error when not meet data type specification", () => {
    // Arrange
    const payload = {
      username: 12345,
      password: "supersecretpassword",
    };

    // Action & Assert
    expect(() => new LoginUser(payload)).toThrowError(
      "LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("Should create login user object correctly", () => {
    // Arrange
    const payload = {
      username: "dicoding",
      password: "supersecretpassword",
    };

    // Action
    const loginUser = new LoginUser(payload);

    // Assert
    expect(loginUser.username).toEqual(payload.username);
    expect(loginUser.password).toEqual(payload.password);
  });
});
