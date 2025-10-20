import fs from "fs";
import os from "os";
import path from "path";


type Config = {
    dbUrl: string;
    currentUserName?: string;
  };
  
export function setUser(userName: string) {
    const config = readConfig();
    config.currentUserName = userName;
    writeConfig(config);
};

export function readConfig() {
    const fullPath = getConfigFilePath();
    const data = fs.readFileSync(fullPath, "utf-8");
    const rawConfig = JSON.parse(data);
    return validateConfig(rawConfig);
};

function getConfigFilePath() {
    const configFileName = ".gatorconfig2.json";
    const homeDir = os.homedir();
    return path.join(homeDir, configFileName);
};

function writeConfig(config: Config) {
    const fullPath = getConfigFilePath();
    const rawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName,
    };
    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(fullPath, data, { encoding: "utf-8" });
};

function validateConfig(rawConfig: any): Config {
    const dbUrl = rawConfig.db_url;
    const currentUserName = rawConfig.current_user_name;
    if (dbUrl === undefined) {
        throw new Error("rawConfig is missing db_url.");
    }
    return { dbUrl: dbUrl, currentUserName: currentUserName ?? ""};
}