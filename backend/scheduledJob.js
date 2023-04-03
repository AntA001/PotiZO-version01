const scheduler = require("node-schedule");
const mongoose = require("mongoose");
const Tree = require("./models/tree");

mongoose.connect(
	`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dy8lm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);

scheduler.scheduleJob("0 0 * * *", () => {
	wateringUpdate();
	console.log("Scheduled job ran at: " + new Date() + ".");
});

async function wateringUpdate() {
	try {
		let trees = await Tree.find();

		for (let i = 0; i < trees.length; i++) {
			if (trees[i].owner == null) {
				continue;
			} else {
				if (trees[i].lastWatered == null) {
					trees[i].needsWatering = true;
					trees[i].save();
				} else if (
					wateringTimePassed(
						trees[i].lastWatered,
						calculateTreeAge(trees[i].date)
					)
				) {
					trees[i].needsWatering = true;
					trees[i].save();
				}
			}
		}

		/*
      console.log(calculateTreeAge(trees[0].date));
      console.log(wateringTimePassed(trees[0].lastWatered,calculateTreeAge(trees[0].date)));
      let d = new Date(trees[0].lastWatered);
      console.log(d.getDate());
      console.log();
      */
	} catch (err) {
		console.log("Error on scheduled job!");
		console.log(err);
	}
}

//Function to dermine if time for watering has passed taking in the date the tree was last watered.
function wateringTimePassed(date, treeAge) {
	let today = new Date();
	let lastWateringDate = new Date(date);
	if (today.getFullYear() == lastWateringDate.getFullYear()) {
		if (today.getMonth() == lastWateringDate.getMonth()) {
			if (treeAge < 3) {
				//Young trees needs watering every 2 days
				if (today.getDate() > lastWateringDate.getDate() + 2) {
					return true;
				} else {
					return false;
				}
			} else {
				//Old trees need watering every 4 days.
				if (today.getDate() > lastWateringDate.getDate() + 4) {
					return true;
				} else {
					return false;
				}
			}
		} else {
			return true;
		}
	} else {
		return true;
	}
}

//Function to calculate tree age for watering time passed function.
function calculateTreeAge(datePlanted) {
	let today = new Date();
	let dateP = new Date(datePlanted);
	return today.getFullYear() - dateP.getFullYear();
}

module.exports = scheduler;
