import createServer from "#Infrastructures/http/createServer";
import container from "#Infrastructures/container";
import dotenv from "dotenv";
dotenv.config();

const start = async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
};

start();
