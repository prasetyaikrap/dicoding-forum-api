const routes = (handler) => [
  {
    method: "GET",
    path: "/",
    handler: (request, h) => handler.getHomeHandler(request, h),
  },
];

export default routes;
