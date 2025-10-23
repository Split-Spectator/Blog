import { readConfig, setUser } from "./config.js";
import { middlewareLoggedIn } from "./commands/middleware";
import {handlerAgg} from "./commands/aggregate.js"
import {handlerAddFeed, handlerFeeds, handlerFollow, handlerListFollowing, handlerUnfollow}from "./commands/feeds";
import {
  type CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin, 
  handlerRegister, 
  handlerReset,
  handlerUsers,
  
} from "./commands/commands";

export async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
      console.log("usage: <command> [args...]");
      process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandsRegistry = {};

 await registerCommand(commandsRegistry, "login", handlerLogin);
 await registerCommand(commandsRegistry, "register", handlerRegister);
 await registerCommand(commandsRegistry, "reset", handlerReset);
 await registerCommand(commandsRegistry, "users", handlerUsers);
 await registerCommand(commandsRegistry, "agg", handlerAgg);
 await registerCommand(commandsRegistry,"addfeed",middlewareLoggedIn(handlerAddFeed));
 await registerCommand(commandsRegistry, "feeds", handlerFeeds);
 await registerCommand(commandsRegistry,"follow",middlewareLoggedIn(handlerFollow));
await registerCommand(commandsRegistry,"following",middlewareLoggedIn(handlerListFollowing));
await registerCommand(commandsRegistry,"unfollow",middlewareLoggedIn(handlerUnfollow)); 
  try {
      await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
      if (err instanceof Error) {
          console.error(`Error running command ${cmdName}: ${err.message}`);
      } else {
          console.error(`Error running command ${cmdName}: ${err}`);
      }
      process.exit(1);
  }
  process.exit(0);
}
main();
