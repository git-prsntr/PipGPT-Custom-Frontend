/**
 * @File Homepage component
 * @Description This componene serves as the landing page for the app
 */

import './homepage.css';
import { Link } from 'react-router-dom';

/**
 * @component Homepage
 * @description Displays the homepage with an introduction to PipGPT and a navigation link to the dashboard.
 * @returns {JSX.Element} The Homepage component.
 */

const Homepage = () => {

    return (
        <div className='homepage'>
            <div className="left">
                <h1>Access the information you need, when you need it.</h1>
                <h2>Powered by <b>PipGPT</b>, Our AI-driven chat system is tailored to provide instant, reliable answers about Sportsnet's data, policies, and more. Simplify your workflow and stay informed with just a few clicks.</h2>
                <div className="features">
                    <div className="feature">
                        <h3>Instant Answers</h3>
                        <p>Get accurate, AI-powered answers to your company-related questions in seconds. No more digging through documents or waiting for emails—find what you need instantly.</p>
                    </div>
                    <div className="feature">
                        <h3>Always Available</h3>
                        <p>Access company knowledge anytime, anywhere. Whether you're in the office or working remotely, our chat system is available 24/7 to support your needs.</p>
                    </div>
                    <div className="feature">
                        <h3>Secure and Confidential</h3>
                        <p>Your data is safe with us. Our chat system is built with advanced security measures to ensure all company information remains confidential and accessible only to authorized staff.</p>
                    </div>
                </div>
                <div className="homebuttons">
                <Link to="/dashboard">Start Using</Link>
                <Link to="">Learn More</Link>
                </div>
                
            </div>
            <div className="right">
                <div className="imgContainer">
                    <img src="/sportsnethomeimagefinal.png" alt="" className="amplogo" />
                </div>
            </div>
        </div>
    )
}

export default Homepage