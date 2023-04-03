const express = require("express");
const treesControllers = require("../controllers/trees-controllers");

const router = express.Router();

router.get("/:tid", treesControllers.getTreeById);

router.get("/user/:uid", treesControllers.getTreesByUserId);

router.get("/", treesControllers.getTrees);

router.patch("/:tid/delete", treesControllers.deleteTree);
router.patch("/:tid/water", treesControllers.waterTree);
router.patch("/:tid/adopt", treesControllers.adoptTree);

module.exports = router;
