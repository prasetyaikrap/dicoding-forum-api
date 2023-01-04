/* istanbul ignore file */
import { createContainer } from "instances-container";

// external agency
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import pool from "#Infrastructures/database/postgres/pool";
import Jwt from "@hapi/jwt";

// service (repository, helper, manager, etc)
import UserRepository from "#Domains/users/UserRepository";
import AuthenticationRepository from "#Domains/authentications/AuthenticationsRepository";
import ThreadRepository from "#Domains/threads/ThreadsRepository";
import UserRepositoryPostgres from "#Infrastructures/repository/UserRepositoryPostgres";
import AuthRepositoryPostgres from "#Infrastructures/repository/AuthRepositoryPostgres";
import ThreadRepositoryPostgres from "#Infrastructures/repository/ThreadRepositoryPostgres";
import BcryptPasswordHash from "#Infrastructures/security/BcryptPasswordHash";
import JwtTokenManager from "#Infrastructures/security/JwtTokenManager";

// use case
import AddUserUseCase from "#Applications/usecase/AddUserUseCase";
import LoginUserUseCase from "#Applications/usecase/LoginUserUseCase";
import LogoutUserUseCase from "#Applications/usecase/LogoutUserUseCase";
import PasswordHash from "#Applications/security/PasswordHash";
import AuthTokenManager from "#Applications/security/AuthTokenManager";
import RefreshAuthUseCase from "#Applications/usecase/RefreshAuthUseCase";
import AddThreadUseCase from "#Applications/usecase/AddThreadUseCase";

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: AuthTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token,
        },
      ],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authTokenManager",
          internal: AuthTokenManager.name,
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },
  {
    key: RefreshAuthUseCase.name,
    Class: RefreshAuthUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authTokenManager",
          internal: AuthTokenManager.name,
        },
      ],
    },
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },
]);

export default container;
