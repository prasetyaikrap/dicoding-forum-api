import AuthenticationsHandler from "#Interfaces/http/api/authentications/handler";
import routes from "#Interfaces/http/api/authentications/routes";

export default {
  name: "authentications",
  register: async (server, { container }) => {
    const authenticationsHandler = new AuthenticationsHandler(container);
    server.route(routes(authenticationsHandler));
  },
};
