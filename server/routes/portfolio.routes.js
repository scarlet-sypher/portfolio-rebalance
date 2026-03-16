import express from "express";
import {
  getComparison,
  getHoldings,
  getHistory,
  saveRebalance,
  updateModelPortfolio,
} from "../controllers/portfolio.controller.js";

const router = express.Router();

router.get("/comparison", getComparison);
router.get("/holdings", getHoldings);
router.get("/history", getHistory);

router.post("/save", saveRebalance);
router.put("/model", updateModelPortfolio);

export default router;
