import { Fragment, useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { apiRequest } from './api';
import * as CommonConstants from "./constants/commonConstants";
import Login from './views/login';
import Header from './components/container/header';
import Routes from './routers/index';
import Footer from './components/container/footer';
import Navbar from './components/container/navbar';

export default function App() {
  const [menuList, setMenuList] = useState([]);

  const getMenu = async () => {
    if (localStorage.getItem(CommonConstants.LS_TOKEN) !== null) {
      try {
        const response = await apiRequest(CommonConstants.METHOD_IS_GET, "/command/menu.json")
        setMenuList(response?.data.data)
      } catch (error) { }
    }
  }
  useEffect(() => { getMenu(); }, []);
  document.title = import.meta.env.VITE_APP_TITLE;
  return (
    <Fragment>
      {
        // localStorage.getItem(CommonConstants.LS_TOKEN) !== null
        // && <h1 className="text-4xl text-blue-700">
        //   Vite Project
        // </h1>
        localStorage.getItem(CommonConstants.LS_TOKEN) !== null
        && <div className="flex min-h-screen">
          <Navbar data={menuList} />
          <div className="lg:pl-72">
            <Header />
            <Routes />
            <Footer />
          </div>
        </div>
      }
      {
        localStorage.getItem(CommonConstants.LS_TOKEN) === null
        && <Login />
      }
    </Fragment>
  )
}