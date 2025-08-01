import React from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { LOCAL_STORAGE } from './constants/common-constants';
import Login from './viewes/Login'
import Dashboard from './viewes/Dashboard';

function App() {
  return (
    <React.Fragment>
      {
        localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) !== null
        && <Dashboard />
      }
      {
        localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) === null
        && <Login />
      }
    </React.Fragment>
  )
}

export default App
