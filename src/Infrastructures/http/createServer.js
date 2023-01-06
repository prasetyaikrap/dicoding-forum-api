import Hapi from "@hapi/hapi";
import Jwt from "@hapi/jwt";

//Interfaces
import users from "#Interfaces/http/api/users/index";
import authentications from "#Interfaces/http/api/authentications/index";
import threads from "#Interfaces/http/api/threads/index";

import DomainErrorTranslator from "#Commons/exceptions/DomainErrorTranslator";
import ClientError from "#Commons/exceptions/ClientError";

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  // External Plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // JWT Auth Strategy
  server.auth.strategy("forumapi_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    // Get response context
    const { response } = request;
    if (response instanceof Error) {
      // Translate error context
      const translatedError = DomainErrorTranslator.translate(response);
      // error handling based on context
      // ClientError Handling
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }
      //continue with Hapi native error handling
      if (!translatedError.isServer) {
        return h.continue;
      }
      // ServerError Handling
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
        error: response,
      });
      newResponse.code(500);
      return newResponse;
    }
    // Continue if no error occured
    return h.continue;
  });

  return server;
};

export default createServer;
