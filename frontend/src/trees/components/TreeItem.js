import React, { useState, useContext } from "react";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import Map from "../../shared/components/UIElements/Map";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import "./TreeItem.css";

const TreeItem = (props) => {
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	const auth = useContext(AuthContext);
	const [showMap, setShowMap] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showWaterModal, setShowWaterModal] = useState(false);

	const openMapHandler = () => setShowMap(true);

	const closeMapHandler = () => setShowMap(false);

	const showDeleteWarningHandler = () => {
		setShowConfirmModal(true);
	};

	const cancelDeleteHandler = () => {
		setShowConfirmModal(false);
	};

	const showWaterConfirmHandler = () => {
		setShowWaterModal(true);
	};

	const cancelWaterHandler = () => {
		setShowWaterModal(false);
	};

	const userId = auth.userId;
	const confirmDeleteHandler = async () => {
		setShowConfirmModal(false);
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/trees/${props.id}/delete`,
				"PATCH",
				JSON.stringify({
					uid: userId,
					tid: props.id,
				}),
				{
					"Content-Type": "application/json",
				}
			);
			props.onDeleteTree(props.id);
		} catch (err) {}
	};

	const confirmWaterHandler = async () => {
		setShowWaterModal(false);
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/trees/${props.id}/water`,
				"PATCH",
				JSON.stringify({
					uid: userId,
					tid: props.id,
				}),
				{
					"Content-Type": "application/json",
				}
			);
			props.onWaterTree(props.id);
		} catch (err) {}
	};

	var watering;
	if (props.lastWatered != null) {
		var parts = props.lastWatered.split("/");
		var lastWateringDate = new Date(parts[0], parts[1] - 1, parts[2]);
		var today = new Date();
		const oneDay = 1000 * 60 * 60 * 24;
		const diffInTime = today.getTime() - lastWateringDate.getTime();
		const diffInDays = Math.round(diffInTime / oneDay);
		if (diffInDays - 1 == 0) {
			watering = "ΣΗΜΕΡΑ";
		} else if (diffInDays - 1 == 1) {
			watering = "ΕΧΘΕΣ";
		} else {
			watering = diffInDays - 1 + " ΜΕΡΕΣ ΠΡΙΝ";
		}
	} else {
		watering = "ΔΕΝ ΕΧΕΙ ΠΟΤΙΣΤΕΙ";
	}

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<Modal
				show={showMap}
				onCancel={closeMapHandler}
				header={props.address}
				contentClass='tree-item__modal-content'
				footerClass='tree-item__modal-actions'
				footer={<Button onClick={closeMapHandler}>ΚΛΕΙΣΤΕ</Button>}>
				<div className='map-container'>
					<Map center={props.coordinates} zoom={16} />
				</div>
			</Modal>
			<Modal
				show={showConfirmModal}
				onCancel={cancelDeleteHandler}
				header='Είστε σίγουροι;'
				footerClass='tree-item__modal-actions'
				footer={
					<React.Fragment>
						<Button inverse onClick={cancelDeleteHandler}>
							ΑΚΥΡΩΣΗ
						</Button>
						<Button danger onClick={confirmDeleteHandler}>
							ΔΙΑΓΡΑΦΗ
						</Button>
					</React.Fragment>
				}>
				<p style={{ textAlign: "center" }}>
					Θέλετε να διαγράψετε αυτό το δέντρο;
				</p>
			</Modal>

			<Modal
				show={showWaterModal}
				onCancel={cancelWaterHandler}
				header='Είστε σίγουροι;'
				footerClass='tree-item__modal-actions'
				footer={
					<React.Fragment>
						<Button danger onClick={cancelWaterHandler}>
							ΑΚΥΡΩΣΗ
						</Button>
						<Button water onClick={confirmWaterHandler}>
							ΕΠΙΒΕΒΑΙΩΣΗ
						</Button>
					</React.Fragment>
				}>
				<p style={{ textAlign: "center" }}>Ποτίσατε αυτό το δέντρο;</p>
			</Modal>

			<li className='tree-item'>
				<Card className='tree-item__content'>
					{isLoading && <LoadingSpinner asOverlay />}
					<div className='tree-item__image'>
						<img src={props.image} alt={props.title} />
					</div>
					<div className='tree-item__info'>
						<h2>{props.title}</h2>
						<h3>{props.address}</h3>
						<p>ΕΙΔΟΣ: {props.type}</p>
						<p>ΤΕΛΕΥΤΑΙΟ ΠΟΤΙΣΜΑ: {watering}</p>
					</div>
					<div className='tree-item__actions'>
						<Button inverse onClick={openMapHandler}>
							ΔΕΙΤΕ ΤΟ ΣΤΟΝ ΧΑΡΤΗ
						</Button>
						<br />
						<Button water onClick={showWaterConfirmHandler}>
							ΠΟΤΙΣΤΕ
						</Button>
						<Button danger onClick={showDeleteWarningHandler}>
							ΔΙΑΓΡΑΦΗ
						</Button>
					</div>
				</Card>
			</li>
		</React.Fragment>
	);
};

export default TreeItem;
