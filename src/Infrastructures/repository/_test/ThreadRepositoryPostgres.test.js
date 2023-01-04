import RegisterUser from "#Domains/users/entities/RegisterUser";
import pool from "#Infrastructures/database/postgres/pool";
import ThreadRepositoryPostgres from "#Infrastructures/repository/ThreadRepositoryPostgres";
import ThreadsTableTestHelper from "#TestHelper/ThreadsTableTestHelper";
import UserRepositoryPostgres from "#Infrastructures/repository/UserRepositoryPostgres";
import UsersTableTestHelper from "#TestHelper/UserTableTestHelper";
import InvariantError from "#Commons/exceptions/InvariantError";

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
    });
  });
});
