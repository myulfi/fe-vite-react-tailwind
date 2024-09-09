import React from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import * as CommonConstants from "./constants/commonConstants";
import Login from './views/login';
import DefaultLayout from './layout/DefaultLayout';
import { Routes, Route } from 'react-router-dom';
import Home from './views/home';

export default function App() {
  document.title = import.meta.env.VITE_APP_TITLE;
  return (
    <React.Fragment>
      {
        localStorage.getItem(CommonConstants.LS_TOKEN) !== null
        && <DefaultLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/home.html" element={<Home />} /> */}
            {/* <Route path="/test/example-template.html" element={<ExampleTemplate />} /> */}
          </Routes>
        </DefaultLayout>
      }
      {
        localStorage.getItem(CommonConstants.LS_TOKEN) === null
        && <Login />
      }
    </React.Fragment>
  )
}