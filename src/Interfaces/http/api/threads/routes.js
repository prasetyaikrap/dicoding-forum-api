const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments",
    handler: (request, h) => handler.postCommentOnThreadHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/threads/{threadId}/comments/{commentId}",
    handler: (request, h) => handler.postReplyOnCommentHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments",
    handler: (request, h) => handler.deleteCommentOnThreadHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}",
    handler: (request, h) => handler.deleteReplyOnCommentHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/threads/{threadId}",
    handler: (request, h) => handler.getThreadDetailHandler(request, h),
  },
];

export default routes;
