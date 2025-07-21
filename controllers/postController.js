const { Shop, Post } = require("../models");
const { hasShop } = require("../helpers/authHelpers");

const mongoose = require("mongoose");

const generatePost = async (req, res) => {
  const shop = await hasShop(req.auth.userId);
  if (!shop) {
    return res.status(404).json({ succes: false, message: "Shop not found." });
  }

  const { type, title, hashtags = [], mentions = [], media = [] } = req.body;

  const simulatedContent = `🌿 ${title}\n\nAujourd'hui, nous voulons vous parler de notre ${title.toLowerCase()} ! 🍅`;

  return res.status(200).json({ success: true, content: simulatedContent });
};

const validatePost = async (req, res) => {};

const getPostsFromShop = async (req, res) => {};

const publishPost = async (req, res) => {};

module.exports = {
  generatePost,
  validatePost,
  getPostsFromShop,
  publishPost,
};
