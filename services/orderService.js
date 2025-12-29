const { OrderCounter } = require("../models");

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await OrderCounter.findOneAndUpdate(
    { year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `C-${year}-${paddedSequence}`;
};

module.exports = {
  generateOrderNumber,
};
