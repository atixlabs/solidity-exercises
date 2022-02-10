# Upgradeable Airdrop

This project is an academic example to showcase how to deploy, upgrade, use a merkle tree, and some tooling that we use in the Blockchain Studio

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# Install proper node version
nvm use
```

Create `.env` file (you can base on [`.env.example`](./.env.example))
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

We also strongly recommend using the fixtures of hardhat-deploy.

### Ethereum Security Toolbox

To check the code statically you can use the Ethereum Security Toolbox made by Trail of Bits.

#### Slither

##### Default option

You could just run the default checking executing

`npm run slither`

##### Flexibile option

Or if you want more flexibility, first execute the command 

`npm run security`

and once inside the docker container run 

```
solc-select 0.8.9
cd project
```

so that you can use the tools there installed.

#### Echidna(not intended to be used yet)

echidna-test takes a contract and a list of invariants (properties that should always remain true) as input. For each invariant, it generates random sequences of calls to the contract and checks if the invariant holds. If it can find some way to falsify the invariant, it prints the call sequence that does so. If it can't, you have some assurance the contract is safe.
Invariants are expressed as Solidity functions with names that begin with echidna_, have no arguments, and return a boolean.

after finishing, a coverage folder will be created containing a copy of the source code with coverage annotations.

* '*' if an execution ended with a STOP
* 'r' if an execution ended with a REVERT
* 'o' if an execution ended with an out-of-gas error
* 'e' if an execution ended with any other error (zero division, assertion failure, etc)

the configuration file default.yalm allows users to choose EVM and test generation parameters

compile contracts

`npm run compile`

then, execute this command passing contract name as argument

`npm run echidna --contract=EchidnaTester`

for more information [here](https://github.com/crytic/echidna)

## Built With

* [Hardhat](https://hardhat.org/) - Task runner

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Versioning

We use [SemVer](http://semver.org/) and [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

To create a new release execute the script

`npm run release`

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/IQAndreas/markdown-licenses) file for details
