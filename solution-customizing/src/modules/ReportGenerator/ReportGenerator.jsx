import React, { useState } from "react";
import "./styles/ReportGenerator.css";

const BodyContent = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div className="repgen">
            <div className="body-content-container">
                {/* Sidebar */}
                <div className={`sidebar-container ${isSidebarVisible ? "visible" : ""}`}>
                    {/* Close (X) button inside the sidebar */}
                    {isSidebarVisible && (
                        <div className='sidebar-icons-ham-icon-wrapper' onClick={toggleSidebar}>
                            <div className="ham-menu-icon active">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="sidebar-main-separator">
                    <div className="navbar-main-separator">
                        <div className='navbar-container'>
                            {/* Show hamburger ONLY when sidebar is hidden */}
                            {!isSidebarVisible && (
                                <div className='sidebar-icons-ham-icon-wrapper' onClick={toggleSidebar}>
                                    <div className="ham-menu-icon">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="main-content-container">
                        <div className="welres-container">
                            <h1 className="welc-text">Hello, Crusch K.</h1>
                        </div>
                        <div className="textbar-container">
                            <textarea placeholder="Ask anything" className="text-input" />
                            <img src="../../icons/repgen/sendmsg.png" className="sendmsg-icon" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BodyContent;
