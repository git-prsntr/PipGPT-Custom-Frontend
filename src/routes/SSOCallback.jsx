import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SSOCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("token");
        const userId = queryParams.get("userId");

        if (token && userId) {
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            navigate("/dashboard");
        } else {
            navigate("/sign-in");
        }
    }, [navigate]);

    return <p>Processing login...</p>;
};

export default SSOCallback;
