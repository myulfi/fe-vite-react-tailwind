import { useEffect, useState } from "react";
import Body from "../components/containers/Body";
import SideBar from "../components/containers/SideBar";

export default function Dashboard() {
    const [tabletFlag, setTabletFlag] = useState(false);
    const [sidebarOpenFlag, setSidebarOpenFlag] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 426;
            const tablet = window.innerWidth < 769;
            setTabletFlag(tablet);
            setSidebarOpenFlag(!mobile);
        }

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div>
            <SideBar tabletFlag={tabletFlag} sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
            <Body sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
        </div>
    )
}