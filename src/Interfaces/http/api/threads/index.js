import ThreadsHandler from "#Interfaces/http/api/threads/handler";
import routes from "#Interfaces/http/api/threads/routes";

export default {
  name: "threads",
  register: async (server, { container }) => {
    const threadsHandler = new ThreadsHandler(container);
    server.route(routes(threadsHandler));
  },
};
