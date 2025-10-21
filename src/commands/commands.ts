import { setUser } from "../config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = Record<string, CommandHandler>;
 

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`Login expects a single argument, the username`);
    }
    const userName = args[0];
    setUser(userName);
    console.log(`User set to ${userName} successfully!`);
};

export function registerCommand(
    registry: CommandsRegistry, 
    cmdName: string, 
    handler: CommandHandler): void {
        registry[cmdName] = handler;
    };

export function runCommand(
    registry: CommandsRegistry, 
    cmdName: string, 
    ...args: string[]): void {
        const handler = registry[cmdName];
        if (!handler) {
            throw new Error(`Unknown command: ${cmdName}`);
        }
        handler(cmdName, ...args);
    };


