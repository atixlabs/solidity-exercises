/* This file was generated in order to avoid the issue reported here https://github.com/dethcrypto/TypeChain/issues/371
 *
 * When creating a custom task, it needs to be added into `hardhat.config.ts` but if it uses typechain it will make everything
 * fail as typechain output will not not have been generated by then leading into a Catch-22 issue [https://en.wikipedia.org/wiki/Catch-22_(logic)].
 *
 * The proposed approach was taken from one of the fixes someone introduced in the before mentioned GH issue.
 */

// eslint-disable-next-line
import config from "./hardhat.base.config";

// import here any custom task you need
import "./scripts/deploy-with-root";

export default config;
