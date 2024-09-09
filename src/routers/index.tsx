import { Routes, Route } from "react-router-dom";

import Home from '../views/home.js';
// import ExampleTemplate from '../views/test/exampleTemplate.jsx';

export default function RoutesIndex() {
    return (
        // https://tailwindui.com/components/application-ui/application-shells/sidebar
        // Light sidebar with constrained content area
        <main className="py-9">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative pd overflow-hidden rounded-xl border border-dashed border-gray-400 opacity-75" style={{ height: "576px" }}>
                    <svg fill="none" className="absolute inset-0 h-full w-full stroke-orange-600"><defs><pattern x="0" y="0" id="pattern-1526ac66-f54a-4681-8fb8-0859d412f251" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"></path></pattern></defs><rect fill="url(#pattern-1526ac66-f54a-4681-8fb8-0859d412f251)" width="100%" height="100%" stroke="none"></rect></svg>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        {/* <Route path="/home.html" element={<Home />} /> */}
                        {/* <Route path="/test/example-template.html" element={<ExampleTemplate />} /> */}
                    </Routes>
                </div>
            </div>
        </main >
    )
}