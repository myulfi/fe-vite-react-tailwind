import { Routes, Route } from "react-router-dom";

import Home from '../views/home.js';
// import ExampleTemplate from '../views/test/exampleTemplate.jsx';

export default function RoutesIndex() {
    return (
        // https://tailwindui.com/components/application-ui/application-shells/sidebar
        // Light sidebar with constrained content area
        <main className="py-9">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Routes>
                    <Route path="/" element={<Home />} />
                    {/* <Route path="/home.html" element={<Home />} /> */}
                    {/* <Route path="/test/example-template.html" element={<ExampleTemplate />} /> */}
                </Routes>
            </div>
        </main>
    )
}