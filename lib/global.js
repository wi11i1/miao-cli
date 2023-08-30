import log4js from "log4js";
import chalk from "chalk";

// Dummy redis. just use Map
globalThis.redis = new Map();

globalThis.logger = log4js.getLogger('[cli]');
logger.chalk = chalk;
logger.red = chalk.red;
logger.green = chalk.green;
logger.yellow = chalk.yellow;
logger.blue = chalk.blue;
logger.magenta = chalk.magenta;
logger.cyan = chalk.cyan;
