import HomeHandler from "#Interfaces/http/api/home/handler";
import routes from "#Interfaces/http/api/home/routes";

export default {
  name: "home",
  register: async (server) => {
    const homeHandler = new HomeHandler();
    server.route(routes(homeHandler));
  },
};
