import UsersHandler from "#Interfaces/http/api/users/handler";
import routes from "#Interfaces/http/api/users/routes";

export default {
  name: "users",
  register: async (server, { container }) => {
    const usersHandler = new UsersHandler(container);
    server.route(routes(usersHandler));
  },
};
