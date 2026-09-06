require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 13370,
      mining: {
        auto: true,
        interval: 1000
      }
    },
    ascendchain: {
      url: process.env.ASCENDCHAIN_RPC_URL || "http://127.0.0.1:8545",
      chainId: 13370,
      accounts: process.env.ASCENDCHAIN_PRIVATE_KEY
        ? [process.env.ASCENDCHAIN_PRIVATE_KEY]
        : ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
    },
    baseSepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
    },
  },
};
