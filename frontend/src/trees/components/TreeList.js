import React from "react";
import Card from "../../shared/components/UIElements/Card";
import TreeItem from "./TreeItem";
import Button from "../../shared/components/FormElements/Button";
import "./TreeList.css";

const TreeList = (props) => {
	if (props.items.length === 0) {
		return (
			<div className='tree-list center'>
				<Card>
					<h2>Δεν βρέθηκαν υιοθετημένα δέντρα, Μήπως θέλετε να ιυοθετήσετε ένα;</h2>
					<Button to='/map'>Υιοθετήστε ένα δέντρο!</Button>
				</Card>
			</div>
		);
	}

	return (
		<ul className='tree-list'>
			{props.items.map((tree) => (
				<TreeItem
					key={tree.id}
					id={tree.id}
					image={
						"https://www.sciencenewsforstudents.org/wp-content/uploads/2020/04/1030_LL_trees-1028x579.png"
					}
					title={tree.title}
					lastWatered={tree.lastWatered}
					needsWatering={tree.needsWatering}
					type={tree.type}
					address={tree.address}
					coordinates={tree.location}
					onDeleteTree={props.onDeleteTree}
					onWaterTree={props.onWaterTree}
				/>
			))}
		</ul>
	);
};

export default TreeList;
