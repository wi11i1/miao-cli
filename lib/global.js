import log4js from "log4js";
import chalk from "chalk";

const cache = new Map();

globalThis.redis = {
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
};

globalThis.logger = log4js.getLogger('[cli]');
logger.chalk = chalk;
logger.red = chalk.red;
logger.green = chalk.green;
logger.yellow = chalk.yellow;
logger.blue = chalk.blue;
logger.magenta = chalk.magenta;
logger.cyan = chalk.cyan;
