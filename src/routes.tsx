import { Routes as ReactRoutes, Route } from "react-router-dom";
import Home from "./viewes/Home";
import Profile from "./viewes/Profile";
import ExampleTemplate from "./viewes/test/ExampleTemplate";
function Routes() {
    return (
        <ReactRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/home.html" element={<Home />} />
            <Route path="/profile.html" element={<Profile />} />
            <Route path="/test/example-template.html" element={<ExampleTemplate />} />
        </ReactRoutes>
    );
}

export default Routes;
