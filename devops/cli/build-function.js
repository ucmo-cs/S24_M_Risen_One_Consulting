const git = require("../modules/git");
const commandLineArgs = require("command-line-args");
const fs = require("node:fs");
const path = require("node:path");
const {
  removeOldFolders,
  buildFunction,
  minifyFunction
} = require("../modules/function-helpers");

const getConfiguration = () => {
  const gitRoot = git.getGitRoot();
  const optionDefinitions = [
    { name: "function", type: String, multiple: true, defaultOption: true },
    { name: "all", type: Boolean }
  ];
  const options = commandLineArgs(optionDefinitions);

  const functionsRoot = path.resolve(gitRoot, "functions");

  let functionNames = [];

  if (!!options["all"]) {
    functionNames = fs
      .readdirSync(functionsRoot, { withFileTypes: true })
      .filter(
        (x) =>
          x.isDirectory() &&
          x.name !== "vscode" &&
          x.name !== "node_modules" &&
          !x.name.startsWith("__") &&
          !x.name.endsWith("__")
      )
      .map((x) => x.name);
  } else {
    functionNames = options["function"]
      .map((x) => x.toLowerCase())
      .filter((value, index, arr) => {
        if (index === arr.indexOf(value)) return value;
      });
  }

  const configuration = {
    gitRoot,
    functionsRoot,
    functionNames
  };

  return configuration;
};

(async () => {
  console.log("Build Function");
  const configuration = await getConfiguration();

  for (const functionName of configuration.functionNames) {
    console.log("====================");
    console.log(`Build Function ${functionName}`);

    removeOldFolders(functionName, configuration.functionsRoot);
    buildFunction(functionName, configuration.functionsRoot);
    await minifyFunction(functionName, configuration.functionsRoot);

    console.log("====================");
  }
})();
