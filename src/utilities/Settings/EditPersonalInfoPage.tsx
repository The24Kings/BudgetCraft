import React, { useState } from "react";
import { deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import {
	IonAlert,
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonLabel,
	IonModal,
	IonPage,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { auth, firestore } from "../FirebaseConfig";
import "../../pages/SettingsPage.css";

const EditPersonalInfoPage: React.FC = () => {
	const [showNameModal, setShowNameModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [newName, setNewName] = useState("");
	const [alertMsg, setAlertMsg] = useState("");
	const [showAlert, setShowAlert] = useState(false);

	const handleChangeName = async (newDisplayName: string) => {
		try {
			const userRef = doc(firestore, "users", auth.currentUser!.uid);
			await updateDoc(userRef, {
				displayName: newDisplayName
			});
			setAlertMsg("Name updated successfully.");
		} catch (err) {
			console.error("Error updating name:", err);
			setAlertMsg("Failed to update name.");
		}
		setShowAlert(true);
	};

	const handleChangePassword = async () => {
		try {
			await sendPasswordResetEmail(auth, auth.currentUser!.email!);
			setAlertMsg("Password reset email sent.");
		} catch (err) {
			console.error("Error sending password reset:", err);
			setAlertMsg("Failed to send password reset email.");
		}
		setShowPasswordModal(false);
		setShowAlert(true);
	};

	const handleDeleteAccount = async () => {
		try {
			await deleteUser(auth.currentUser!);
			alert("Account deleted. You will be logged out.");
			window.location.href = "/login";
		} catch (err) {
			console.error("Error deleting account:", err);
			setAlertMsg("Failed to delete account. You may need to re-authenticate.");
			setShowAlert(true);
		}
		setShowDeleteModal(false);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Edit Personal Info</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="ion-padding">
				<div className="settings-container">
					<IonItem
						button
						className="settings-item"
						onClick={() => setShowNameModal(true)}
					>
						<IonLabel>Change Display Name</IonLabel>
					</IonItem>
					<IonItem
						button
						className="settings-item"
						onClick={() => setShowPasswordModal(true)}
					>
						<IonLabel>Change Password</IonLabel>
					</IonItem>
					<IonItem
						button
						className="settings-item"
						onClick={() => setShowDeleteModal(true)}
					>
						<IonLabel color="danger">Delete Account</IonLabel>
					</IonItem>
				</div>

				{/* Change Display Name Modal */}
				<IonModal isOpen={showNameModal} onDidDismiss={() => setShowNameModal(false)}>
					<IonHeader className="edit-name-modal-header">
						<IonToolbar>
							<IonTitle>Change Display Name</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<IonItem>
							<IonLabel position="stacked">New Display Name</IonLabel>
							<IonInput
								value={newName}
								onIonInput={(e) => setNewName(e.detail.value!)}
								placeholder="Enter new display name"
							/>
						</IonItem>
						<IonButton
							expand="block"
							fill="solid"
							className="mint-button ion-margin-top"
							onClick={() => {
								if (newName.trim() === "") {
									setAlertMsg("Display name cannot be empty.");
									setShowAlert(true);
									return;
								}
								handleChangeName(newName);
								setShowNameModal(false);
							}}
						>
							Save
						</IonButton>
						<IonButton
							expand="block"
							fill="solid"
							className="danger-button ion-margin-top"
							onClick={() => setShowNameModal(false)}
						>
							Cancel
						</IonButton>
					</IonContent>
				</IonModal>

				{/* Change Password Modal */}
				<IonModal
					isOpen={showPasswordModal}
					onDidDismiss={() => setShowPasswordModal(false)}
				>
					<IonHeader className="edit-name-modal-header">
						<IonToolbar>
							<IonTitle>Reset Password</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<p>
							We'll send a password reset email to{" "}
							<strong>{auth.currentUser?.email}</strong>.
						</p>
						<IonButton
							expand="block"
							fill="solid"
							className="mint-button ion-margin-top"
							onClick={handleChangePassword}
						>
							Send Reset Email
						</IonButton>
						<IonButton
							expand="block"
							fill="solid"
							className="danger-button ion-margin-top"
							onClick={() => setShowPasswordModal(false)}
						>
							Cancel
						</IonButton>
					</IonContent>
				</IonModal>

				{/* Delete Account Modal */}
				<IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)}>
					<IonHeader className="edit-name-modal-header">
						<IonToolbar>
							<IonTitle>Delete Account</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<p>Are you sure you want to permanently delete your account?</p>
						<IonButton
							expand="block"
							fill="solid"
							className="danger-button ion-margin-top"
							onClick={handleDeleteAccount}
						>
							Yes, Delete My Account
						</IonButton>
						<IonButton
							expand="block"
							fill="solid"
							className="mint-button ion-margin-top"
							onClick={() => setShowDeleteModal(false)}
						>
							Cancel
						</IonButton>
					</IonContent>
				</IonModal>

				<IonAlert
					isOpen={showAlert}
					onDidDismiss={() => setShowAlert(false)}
					header="Notice"
					message={alertMsg}
					buttons={["OK"]}
				/>
			</IonContent>
		</IonPage>
	);
};

export default EditPersonalInfoPage;
