import { readConfig, setUser } from "./config.js";

export function main() {
  setUser("Test");
  const cfg = readConfig();
  console.log(cfg);
}

main();
