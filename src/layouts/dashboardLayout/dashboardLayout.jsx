import { Outlet, useNavigate} from 'react-router-dom';
import './dashboardLayout.css';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import ChatList from "../../components/chatList/chatList";
import DashboardMenuLeft from '../../components/dashboardmenuleft/dashboardMenuLeft';

const DashboardLayout = () => {

  //Temporarily hidden to bypass signin
/*
    const {userId, isLoaded} = useAuth()
    const navigate = useNavigate()

    useEffect (() =>{
        if(isLoaded && !userId){
            navigate("/sign-in");
        }
    },[isLoaded, userId, navigate]);

    if(!isLoaded) return "Loading...";
*/

    return (
      <div className='dashboardLayout'>
        <div className="menuleft"><DashboardMenuLeft /></div>
        
        <div className="content">
          <Outlet />
        </div>
        <div className="menuright"><ChatList /></div>
      </div>
    );
};

export default DashboardLayout;