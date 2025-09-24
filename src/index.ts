import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ethers } from "ethers";
import OpenAI from "openai";
import User from "./models/User";
import cors from "cors"
dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

// --- Blockchain Setup ---
const provider = new ethers.JsonRpcProvider(process.env.MONAD_TESTNET_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const abi = ["function reward(address user, uint amount) external"];
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet);

// --- AI Setup ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Routes ---
app.post("/swap", async (req, res) => {
  const { user, message, signature } = req.body;

  try {

     const recovered = ethers.verifyMessage("Sign in to Monad Swap", signature);
  if (recovered.toLowerCase() !== user.toLowerCase()) {
    return res.status(401).json({ error: "Invalid signature" });
  }


    // Save message in DB
    let dbUser = await User.findOne({ address: user });
    if (!dbUser) dbUser = await User.create({ address: user, messages: [], tokensEarned: 0 });
    dbUser.messages.push(message);

    // AI decides reward
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const aiText = completion.choices[0].message?.content || "";
    let reward = 1;
    if (aiText.toLowerCase().includes("exercise") || aiText.toLowerCase().includes("water")) {
      reward = 10;
    }

    // Send tokens
    const tx = await contract.reward(user, reward);
    await tx.wait();

    // Update DB
    dbUser.tokensEarned += reward;
    await dbUser.save();

    res.json({ success: true, reward, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// --- Start Server ---
mongoose.connect(process.env.MONGO_URI!).then(() => {
  app.listen(3000, () => console.log("Server running on http://localhost:3000"));
});
