
import log4js from 'log4js';

const logger = log4js.getLogger('MyL');
logger.level = 'all';

export default logger;


// Darker blue:
// logger.trace("Entering cheese testing");
// Lighter blue:
// logger.debug("Got cheese.");
// Green:
// logger.info("Cheese is Comté.");
// Yellow:
// logger.warn("Cheese is quite smelly.");
// Red:
// logger.error("Cheese is too ripe!");
// Purple:
// logger.fatal("Cheese was breeding ground for listeria.");