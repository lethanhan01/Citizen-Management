const serverless = require("serverless-http");

module.exports.api = async (event, context) => {
    const { default: app } = await import("./index.js");
    return serverless(app)(event, context);
};
