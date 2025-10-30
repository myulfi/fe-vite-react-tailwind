import { useEffect, useState } from "react";
import Body from "../components/containers/Body";
import SideBar from "../components/containers/SideBar";

export default function Dashboard() {
    const [tabletFlag, setTabletFlag] = useState(false);
    const [sidebarOpenFlag, setSidebarOpenFlag] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            const tablet = window.innerWidth < 769;
            const laptop = window.innerWidth < 1024;
            setTabletFlag(tablet);
            setSidebarOpenFlag(!laptop);
        }

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return (
        <div>
            <SideBar tabletFlag={tabletFlag} sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
            <Body sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
        </div>
    )
}