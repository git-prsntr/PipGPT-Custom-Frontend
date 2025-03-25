/**
 * Entry point for the React application.
 * 
 * - Sets up React Router with nested routes.
 * - Provides routing for authentication, dashboard, tools, and settings.
 * - Renders the application inside `root` div.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './routes/homePage/homepage';
import Dashboardpage from './routes/dashboardPage/dashboardpage';
import Chatpage from './routes/chatPage/chatpage';
import RootLayout from './layouts/rootLayout/rootLayout';
import DashboardLayout from './layouts/dashboardLayout/dashboardLayout';
import Signuppage from './routes/signupPage/signuppage';
import Signinpage from './routes/signinPage/signinpage';
import SlidesGenerator from './routes/slidesGenerator/slidesGenerator'; 
import ReportGenerator from './routes/reportGenerator/reportGenerator'; 
import ContentWriter from './routes/contentWriter/contentWriter'; 
import DataVisualiser from './routes/dataVisualiser/dataVisualiser'; 
import InternalDocuments from './routes/internalDocuments/internalDocuments';
import AboutPage from './routes/aboutPage/aboutPage';
import SettingsPage from './routes/settingsPage/settingsPage';
import TemporaryChat from './routes/temporaryChatPage/temporaryChat';
import ErrorPage from './routes/errorPage/errorPage';
import InstantLookup from './routes/instantLookup/instantLookup';
import ExamplePrompts from './routes/examplePrompts/examplePrompts';
import AccountVerification from './routes/accountVerification/accountVerification';
import ResetPassword from './routes/resetPassword/resetPassword';


/**
 * Defines application routes using React Router.
 * 
 * - Root layout wraps all routes.
 * - Dashboard layout includes dashboard-related routes.
 * - Tools, settings, and additional features are nested inside the dashboard.
 */

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/sign-in/*",
        element: <Signinpage />,
      },
      {
        path: "/sign-up/*",
        element: <Signuppage />,
      },
      {
        path:"/accountverification",
        element:<AccountVerification/>,
      },
      {
        path:"/resetpassword",
        element:<ResetPassword/>,
      },
      
      {
        element: <DashboardLayout />,
        errorElement: <ErrorPage/>,
        children: [
          {
            path: "/dashboard",
            element: <Dashboardpage />,
          },
          {
            path: "/dashboard/chats/:id",
            element: <Chatpage />,
          },
          {
            path: "/dashboard/tools/slidesgenerator", 
            element: <SlidesGenerator />,
          },
          {
            path: "/dashboard/tools/reportgenerator", 
            element: <ReportGenerator />,
          },
          {
            path: "/dashboard/tools/contentwriter", 
            element: <ContentWriter />,
          },
          {
            path: "/dashboard/tools/datavisualiser", 
            element: <DataVisualiser />,
          },
          {
            path: "/internal-documents", 
            element: <InternalDocuments />,
          },
          {
            path: "/temporarychat", 
            element: <TemporaryChat />,
          },
          {
            path: "/instantlookup", 
            element: <InstantLookup />,
          },
          {
            path: "/about", 
            element: <AboutPage />,
          },
          {
            path: "/settings", 
            element: <SettingsPage />,
          },
          {
            path: "/exampleprompts", 
            element: <ExamplePrompts />,
          },
        ],
      },
      {
        path: "*", // Catch-all route for unknown paths (404)
        element: <ErrorPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);