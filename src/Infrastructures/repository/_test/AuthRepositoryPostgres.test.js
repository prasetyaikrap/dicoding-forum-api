import InvariantError from "#Commons/exceptions/InvariantError";
import pool from "#Infrastructures/database/postgres/pool";
import AuthTableTestHelper from "#TestHelper/AuthTableTestHelper";
import AuthRepositoryPostgres from "#Infrastructures/repository/AuthRepositoryPostgres";

describe("AuthRepositoryPostgres", () => {
  afterEach(async () => {
    await AuthTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addToken function", () => {
    it("should add token to database", async () => {
      // Arrange
      const authenticationRepository = new AuthRepositoryPostgres(pool);
      const token = "token";

      // Action
      await authenticationRepository.addToken(token);

      // Assert
      const tokens = await AuthTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe("checkAvailabilityToken function", () => {
    it("should throw InvariantError if token not available", async () => {
      // Arrange
      const authenticationRepository = new AuthRepositoryPostgres(pool);
      const token = "token";

      // Action & Assert
      await expect(
        authenticationRepository.checkAvailabilityToken(token)
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError if token available", async () => {
      // Arrange
      const authenticationRepository = new AuthRepositoryPostgres(pool);
      const token = "token";
      await AuthTableTestHelper.addToken(token);

      // Action & Assert
      await expect(
        authenticationRepository.checkAvailabilityToken(token)
      ).resolves.not.toThrow(InvariantError);
    });
  });

  describe("deleteToken", () => {
    it("should throw InvariantError when failed to delete token", async () => {
      // Arrange
      const authenticationRepository = new AuthRepositoryPostgres(pool);
      const token = "token";

      // Action & Assert
      await expect(() =>
        authenticationRepository.deleteToken(token)
      ).rejects.toThrow(InvariantError);
    });

    it("should delete token from database", async () => {
      // Arrange
      const authenticationRepository = new AuthRepositoryPostgres(pool);
      const token = "token";
      await AuthTableTestHelper.addToken(token);

      // Action
      await authenticationRepository.deleteToken(token);

      // Assert
      const tokens = await AuthTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
