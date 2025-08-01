import { Routes as ReactRoutes, Route } from "react-router-dom";
import Home from "./viewes/Home";
import Profile from "./viewes/Profile";
function Routes() {
    return (
        <ReactRoutes>
            <Route path="/" element={< Home />} />
            <Route path="/home" element={< Home />} />
            <Route path="/profile" element={< Profile />} />
        </ReactRoutes>
    );
}

export default Routes;
