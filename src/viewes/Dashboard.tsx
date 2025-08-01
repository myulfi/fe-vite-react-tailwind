import React, { useEffect, useState } from "react";
import Body from "../components/containers/Body";
import SideBar from "../components/containers/SideBar";

export default function Dashboard() {
    const [mobileFlag, setMobileFlag] = useState(false);
    const [sidebarOpenFlag, setSidebarOpenFlag] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setMobileFlag(mobile);
            setSidebarOpenFlag(!mobile);
        }

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <React.Fragment>
            <SideBar mobileFlag={mobileFlag} sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
            <Body mobileFlag={mobileFlag} sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
        </React.Fragment>
    )
}