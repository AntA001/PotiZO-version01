const HttpError = require("../models/http-error");
const Tree = require("../models/tree");
const User = require("../models/user");

const getTreeById = async (req, res, next) => {
	const treeId = req.params.tid;

	let tree;
	try {
		tree = await Tree.findById(treeId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not find a tree.",
			500
		);
		return next(error);
	}

	if (!treeId) {
		const error = new HttpError(
			"Could not find tree for the provided id.",
			404
		);
		return next(error);
	}

	res.json({ tree: tree.toObject({ getters: true }) });
};

const getTreesByUserId = async (req, res, next) => {
	const userId = req.params.uid;
	let userWithTrees;
	try {
		userWithTrees = await User.findById(userId).populate("trees");
	} catch {}
	res.json({
		trees: userWithTrees.trees.map((tree) => tree.toObject({ getters: true })),
	});
};

const getTrees = async (req, res, next) => {
	let allTrees;
	try {
		allTrees = await Tree.find();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not find trees.",
			500
		);
		return next(error);
	}

	if (!allTrees) {
		const error = new HttpError("Could not find trees", 404);
		return next(error);
	}

	res.json({
		trees: allTrees.map((tree) => tree.toObject({ getters: true })),
	});
};

const deleteTree = async (req, res, next) => {
	const treeId = req.body.tid;
	const userId = req.body.uid;
	let tree;
	let user;
	try {
		tree = await Tree.findById(treeId);
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete tree.",
			500
		);
		return next(error);
	}

	if (!treeId) {
		const error = new HttpError("Could not find tree for this id.", 404);
		return next(error);
	}

	if (tree.owner != userId) {
		const error = new HttpError(
			"You are not allowed to delete this tree.",
			401
		);
		return next(error);
	}

	tree.owner = null;
	user.trees.pull(treeId);
	try {
		await user.save();
		await tree.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete tree.",
			500
		);
		return next(error);
	}

	res.status(200).json({ message: "Deleted tree." });
};

const waterTree = async (req, res, next) => {
	const treeId = req.body.tid;
	const userId = req.body.uid;

	let tree;
	try {
		tree = await Tree.findById(treeId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not water tree.",
			500
		);
		return next(error);
	}

	if (!treeId) {
		const error = new HttpError("Could not find tree for this id.", 404);
		return next(error);
	}

	if (tree.owner != userId) {
		const error = new HttpError("You are not allowed to water this tree.", 401);
		return next(error);
	}

	var today = new Date();
	var dd = String(today.getDate()).padStart(2, "0");
	var mm = String(today.getMonth() + 1).padStart(2, "0");
	var yyyy = today.getFullYear();
	today = yyyy + "/" + mm + "/" + dd;
	tree.needsWatering = false;
	tree.lastWatered = today;

	try {
		await tree.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not water tree.",
			500
		);
		return next(error);
	}

	res.status(200).json({ message: "Tree Watered." });
};

const adoptTree = async (req, res, next) => {
	const treeId = req.body.tid;
	const userId = req.body.uid;
	let tree;
	let user;

	try {
		tree = await Tree.findById(treeId);
		user = await User.findById(userId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not adopt tree.",
			500
		);
		return next(error);
	}

	if (!treeId) {
		const error = new HttpError("Could not find tree for this id.", 404);
		return next(error);
	}
	if (user.trees.length >= 3) {
		const error = new HttpError("Max trees reached.", 404);
		return next(error);
	}

	user.trees.push(treeId);
	tree.owner = userId;

	try {
		await user.save();
		await tree.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not adopt tree.",
			500
		);
		return next(error);
	}

	res.status(200).json({ message: "Tree Adopted." });
};

exports.getTreeById = getTreeById;
exports.getTreesByUserId = getTreesByUserId;
exports.getTrees = getTrees;
exports.deleteTree = deleteTree;
exports.waterTree = waterTree;
exports.adoptTree = adoptTree;
