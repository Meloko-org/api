const { PostTheme } = require("../models");
const mongoose = require("mongoose");

const getThemes = async (req, res) => {
  const themes = await PostTheme.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json(themes);
};

module.exports = {
  getThemes,
};
