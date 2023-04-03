const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const treeSchema = new Schema({
	title: { type: String, required: true, default: "Tree" },
	type: { type: String, required: true },
	address: { type: String, required: true },
	location: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true },
	},
	zip :{type: String, required: false},
	date: { type: String, required: true },
	lastWatered: { type: String, required: false },
	needsWatering: { type: Boolean, required: true, default: false },
	owner: { type: mongoose.Types.ObjectId, required: false, ref: "User" },
	isAlive: { type: Boolean, required: true, default: true },
});

module.exports = mongoose.model("Tree", treeSchema);
