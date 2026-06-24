import {Navigate} from "react-router-dom";
import {useAuth} from "./AuthContext";
// ROUTE GUARD TO PREVENT VISITING DIRECT URL LINKS
export default function RequireAuth({children}) {
    const {user, loading} = useAuth(); //Gets logged in user and checks if app is still loading

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />; //If no user logged in, send to login page

    return children
}