module.exports = {
  migrations_directory: "./migrations",
  rpc: {
    host: "localhost",
    port: 7545
  },
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*",
      gas: 4712388
    }
  }
};
