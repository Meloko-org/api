const { Shop, User, Producer } = require("../models");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const mongoose = require("mongoose");

const addCrewMember = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { forname, role, description, photo } = req.body;

    const crew = shop.crew.push({ forname, role, description, photo });

    await Shop.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const deleteCrewMember = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { memberId } = req.params;

    const member = shop.crew.id(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "crew member not found." });
    }

    member.remove();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const updateCrewMember = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { memberId } = req.params;

    const member = shop.crew.id(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Crew member not found." });
    }

    if (forname !== undefined) member.forname = forname;
    if (role !== undefined) member.role = role;
    if (description !== undefined) member.description = description;
    if (photo !== undefined) member.photo = photo;

    await shop.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

module.exports = {
  addCrewMember,
  deleteCrewMember,
  updateCrewMember,
};
