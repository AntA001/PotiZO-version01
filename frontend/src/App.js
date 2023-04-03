import React, { Suspense } from "react";
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Switch,
} from "react-router-dom";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";

const UserTrees = React.lazy(() => import("./trees/pages/UserTrees"));
const MapDeckGl = React.lazy(() => import("./trees/pages/MapDeckGl"));
const Auth = React.lazy(() => import("./user/pages/Auth"));

const App = () => {
	const { token, login, logout, userId } = useAuth();

	let routes;

	if (token) {
		routes = (
			<Switch>
				<Route path='/trees' exact>
					<UserTrees />
				</Route>
				<Route path='/map' exact>
					<MapDeckGl />
				</Route>
				<Route path='/' exact>
					<UserTrees />
				</Route>
				<Redirect to='/trees' />
			</Switch>
		);
	} else {
		routes = (
			<Switch>
				<Route path='/' exact>
					<Auth />
				</Route>
				<Route path='/auth'>
					<Auth />
				</Route>
				<Redirect to='/' />
			</Switch>
		);
	}

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!token,
				token: token,
				userId: userId,
				login: login,
				logout: logout,
			}}>
			<Router>
				<MainNavigation />
				<main>
					<Suspense
						fallback={
							<div className='center'>
								<LoadingSpinner />
							</div>
						}>
						{routes}
					</Suspense>
				</main>
			</Router>
		</AuthContext.Provider>
	);
};

export default App;
