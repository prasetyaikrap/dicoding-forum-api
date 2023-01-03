import Hapi from "@hapi/hapi";

//Interfaces
import users from "#Interfaces/http/api/users/index";
import authentications from "#Interfaces/http/api/authentications/index";

import DomainErrorTranslator from "#Commons/exceptions/DomainErrorTranslator";
import ClientError from "#Commons/exceptions/ClientError";

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
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
