# Project Title

This project contains the boilerplate that must be used when dealing with Solidity based Smart Contracts developmen projects.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# Install proper node version
nvm use
```
### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```bash
# Install the dependencies
npm install
```

### Generate Types

In order to get contract types you can generate those typings when compiling

```bash
npm run compile
```

## Running the tests

```bash
npm run test
```

### Testing with Waffle

Tests using Waffle are written with Mocha alongside with Chai. 

Is recommended to use Gherkin as a language to describe the test cases

```
describe("Feature: Greeter", () => {
  describe("Scenario: Should return the new greeting once it's changed", () => {
    let greeter: Greeter;
    it("GIVEN a deployed Greeter contract", async () => {
      const factory = await ethers.getContractFactory("Greeter");
      greeter = <Greeter>await factory.deploy("Hello, world!");
      expect(await greeter.greet()).to.equal("Hello, world!");
    });
    it("WHEN greeting message changed", async () => {
      await greeter.setGreeting("Hola, mundo!");
    });
    it("THEN greet returns new greeting message", async () => {
      expect(await greeter.greet()).to.equal("Hola, mundo!");
    });
  });
});
```

We are requiring Chai which is an assertions library. These asserting functions are called "matchers", and the ones we're using here actually come from Waffle.

For more information we suggest reading waffle testing documentation [here](https://hardhat.org/guides/waffle-testing.html#testing).

## Scripts

```bash

npm run compile       #Compile the contract
npm run test          #Runs automated tests
npm run lint          #Executes a linter over your files
npm run format        #Executes a prettier over your files
npm run node          #Runs a local mockchain
npm run deploy-local  #Deploys the contract in a local network
npm run console-local #Runs an interactive console pointing to the local network

```

## Deployment

To deploy your contract locally

- Run a local mockchain: `npm run node`
- Open another terminal and deploy your contracts locally: `npm run deploy-local`
- You can interact with your contract through the console: `npm run console-local`

## Built With

* [Hardhat](https://hardhat.org/) - Task runner

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.


## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/IQAndreas/markdown-licenses) file for details
