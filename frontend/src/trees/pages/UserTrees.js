import React, { useEffect, useState, useContext } from "react";
import TreeList from "../components/TreeList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

const UserTrees = () => {
	const [loadedTrees, setLoadedTrees] = useState();
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	const auth = useContext(AuthContext);

	const userId = auth.userId;

	useEffect(() => {
		const fetchTrees = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/trees/user/${userId}`
				);
				setLoadedTrees(responseData.trees);
			} catch (err) {}
		};
		fetchTrees();
	}, [sendRequest, userId]);

	const TreeDeletedHandler = (deletedTreeId) => {
		setLoadedTrees((prevTrees) =>
			prevTrees.filter((tree) => tree.id != deletedTreeId)
		);
	};

	const TreeWaterHandler = (WateredTreeId) => {
		window.location.reload(false);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className='center'>
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedTrees && (
				<TreeList
					items={loadedTrees}
					onDeleteTree={TreeDeletedHandler}
					onWaterTree={TreeWaterHandler}
				/>
			)}
		</React.Fragment>
	);
};

export default UserTrees;
