/**
 * @file DashboardLayout Component
 * @description This component serves as the layout for the dashboard, ensuring authentication and displaying the chat list alongside routed content.
 */


import { Outlet, useNavigate } from 'react-router-dom';
import './dashboardLayout.css';
import { useEffect } from 'react';
import ChatList from "../../components/chatList/chatList";
import DashboardMenuLeft from '../../components/dashboardmenuleft/dashboardMenuLeft';


/**
 * @component DashboardLayout
 * @description Ensures user authentication and renders the dashboard layout with a menu and main content area.
 * @returns {JSX.Element} The dashboard layout component
 */

const DashboardLayout = () => {

  // const { userId, isLoaded } = useAuth()
  const token = localStorage.getItem("token");
  const navigate = useNavigate()


  // Redirects user to sign-in page if they are not authenticated.
  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
    }
  }, [navigate]);

  


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