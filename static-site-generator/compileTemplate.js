const ejs = require("ejs");
const Promise = require("bluebird");

// TODO - better error messages
const compileTemplate = (contents, context) =>
  Promise.try(() => ejs.render(contents, context));

module.exports = compileTemplate;
