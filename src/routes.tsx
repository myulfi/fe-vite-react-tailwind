import { Routes as ReactRoutes, Route } from "react-router-dom";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Database from "./views/external/Database";
import ExampleTemplate from "./views/test/ExampleTemplate";
function Routes() {
    return (
        <ReactRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/home.html" element={<Home />} />
            <Route path="/profile.html" element={<Profile />} />
            <Route path="/external/database.html" element={<Database />} />
            <Route path="/test/example-template.html" element={<ExampleTemplate />} />
        </ReactRoutes>
    );
}

export default Routes;
