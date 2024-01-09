import config from "./config.json";
import { ExtendedClient } from "./structs/extendedClient";
export * from "colors";

const client = new ExtendedClient();

client.start();

export { client, config };
