import { Routes as ReactRoutes, Route } from "react-router-dom";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Database from "./views/external/Database";
import ExampleTemplate from "./views/test/ExampleTemplate";
import Server from "./views/external/Server";
import ApplicationProgrammingInterface from "./views/external/ApplicationProgrammingInterface";
function Routes() {
    return (
        <ReactRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/home.html" element={<Home />} />
            <Route path="/profile.html" element={<Profile />} />
            <Route path="/external/server.html" element={<Server />} />
            <Route path="/external/database.html" element={<Database />} />
            <Route path="/external/api.html" element={<ApplicationProgrammingInterface />} />
            <Route path="/test/example-template.html" element={<ExampleTemplate />} />
        </ReactRoutes>
    );
}

export default Routes;
