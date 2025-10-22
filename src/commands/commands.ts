
import { DrizzleQueryError } from "drizzle-orm";
import { readConfig, setUser } from "../config";
import { createUser, getUserByName, deleteUsers, getUsers  } from "src/lib/db/queries/users"
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
 

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`Login expects a single argument, the username`);
    }
    const userName = args[0];
    if (!await getUserByName(userName)) {
        throw new Error(`user name "${userName}" doesn't exist in the database!`)
    }
    setUser(userName);
    console.log(`User set to ${userName} successfully!`);
};

export async function registerCommand(
    registry: CommandsRegistry, 
    cmdName: string, 
    handler: CommandHandler): Promise<void> {
        registry[cmdName] = handler;
    };

export async function runCommand(
    registry: CommandsRegistry, 
    cmdName: string, 
    ...args: string[]): Promise<void>  {
        const handler = registry[cmdName];
        if (!handler) {
            throw new Error(`Unknown command: ${cmdName}`);
        }
        await  handler(cmdName, ...args);
    };

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <name>`);
    }
    const userName = args[0];
    let result = undefined;
    try {
        result = await createUser(userName);
    }
    catch (error) {
        console.log(error)
        if (error instanceof DrizzleQueryError) {
            throw new Error("User already exists!");
        }
        else {
            throw new Error(`Unknown error: ${error}`);
        }
    } 
    setUser(result.name)

console.log("User created successfully!");
console.log(`User data: ${JSON.stringify(result)}`)
}


export async function handlerReset(_cmdName: string, ..._args: string[]) {
    let result = undefined;
    try {
        result = await deleteUsers();
    }
    catch (error) {
        console.log(error);
        if (error instanceof DrizzleQueryError) {
            throw new Error("Couldn't delete users!");
        }
        else {
            throw new Error(`Unknown error: ${error}`);
        }
    }
    console.log("Reset successfull! Users deleted!");
}


export async function handlerUsers(_cmdName: string, ..._args: string[]) {
    let users = undefined;
    try {
        users = await getUsers();
    }
    catch (error) {
        console.log(error);
        if (error instanceof DrizzleQueryError) {
            throw new Error("Couldn't get users!");
        }
        else {
            throw new Error(`Unknown error: ${error}`);
        }
    }
        const config = readConfig();
        const currentUserName = config.currentUserName;
        if (users.length === 0) {
            console.log("No users defined in the database!")
            return;
        }
        for (const user of users) {
            console.log(`* ${user.name}${currentUserName == user.name ? " (current)" : ""}`)
        }
    }
