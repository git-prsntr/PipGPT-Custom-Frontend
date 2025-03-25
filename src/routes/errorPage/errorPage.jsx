import { useRouteError } from "react-router-dom";

/**
 * ErrorPage Component - Displays a custom error page for route errors.
 * Uses `useRouteError` to get error details and shows a user-friendly message.
 */
const ErrorPage = () => {
    const error = useRouteError();
    
    return (
        <div className="error-page">
            <h1>Oops! Something went wrong</h1>
            <p>{error?.statusText || error?.message || "An unexpected error occurred."}</p>
            <a href="/dashboard" className="gotoDashboard">Go To Dashboard</a>
        </div>
    );
};

export default ErrorPage;
