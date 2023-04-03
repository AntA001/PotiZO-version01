import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = (props) => {
	const auth = useContext(AuthContext);

	return (
		<ul className='nav-links'>
			{auth.isLoggedIn && (
				<li>
					<NavLink to={"/trees"}>Τα δέντρα μου</NavLink>
				</li>
			)}
			{auth.isLoggedIn && (
				<li>
					<NavLink to={"/map"}>Χάρτης δέντρων</NavLink>
				</li>
			)}
			{!auth.isLoggedIn && (
				<li>
					<NavLink to='/auth'>Σύνδεση</NavLink>
				</li>
			)}
			{auth.isLoggedIn && (
				<li>
					<button onClick={auth.logout}>Αποσύνδεση</button>
				</li>
			)}
		</ul>
	);
};

export default NavLinks;
