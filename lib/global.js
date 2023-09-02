import log4js from "log4js";
import chalk from "chalk";
import Version from "../plugins/miao-plugin/components/Version.js";

// Version Change
Version.name = "wi11i1/miao-cli";

// Dummy redis. just use Map
globalThis.redis = new Map();

// Logging
log4js.configure({
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%[[Miao-CLI][%d{hh:mm:ss.SSS}][%4.4p]%] %m",
      },
    },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
  },
});

globalThis.logger = log4js.getLogger("message");
logger.chalk = chalk;
logger.red = chalk.red;
logger.green = chalk.green;
logger.yellow = chalk.yellow;
logger.blue = chalk.blue;
logger.magenta = chalk.magenta;
logger.cyan = chalk.cyan;
