const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("XiuxianGameModule", (m) => {
  const xiuxianGame = m.contract("XiuxianGame");

  return { xiuxianGame };
});
