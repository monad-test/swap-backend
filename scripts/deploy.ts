import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Get the contract factory
  const SwapToken = await ethers.getContractFactory("SwapToken");
  
  // Deploy the contract
  console.log("Deploying SwapToken contract...");
  const token = await SwapToken.deploy();
  
  // Wait for deployment to be mined
  await token.waitForDeployment();
  
  const contractAddress = await token.getAddress();
  console.log("SwapToken deployed to:", contractAddress);

  // Verify deployment
  console.log("Deployment completed successfully!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });
