// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { LOCAL_STORAGE } from './constants/common-constants';
import Login from './views/Login';
import Dashboard from './views/Dashboard';

function App() {
  return (
    <div className='custom-scrollbar'>
      {
        localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) !== null
        && <Dashboard />
      }
      {
        localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN) === null
        && <Login />
      }
    </div>
  )
}

export default App
