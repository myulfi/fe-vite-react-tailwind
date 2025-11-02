import { useEffect, useRef, useState } from "react";
import Body from "../components/containers/Body";
import SideBar from "../components/containers/SideBar";
import { LOCAL_STORAGE } from "../constants/common-constants";

export default function Dashboard() {
    const [tabletFlag, setTabletFlag] = useState(false);
    const [sidebarOpenFlag, setSidebarOpenFlag] = useState(true);
    const [laserActive, setLaserActive] = useState<boolean>(localStorage.getItem(LOCAL_STORAGE.LASER) === "true");

    const TAIL_LENGTH = 10;

    interface Position {
        x: number;
        y: number;
    };

    useEffect(() => {
        const checkDevice = () => {
            const tablet = window.innerWidth < 1024;
            setTabletFlag(tablet);
            setSidebarOpenFlag(!tablet);
        }

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === "l") {
                const newValue = !(localStorage.getItem(LOCAL_STORAGE.LASER) === "true");
                localStorage.setItem(LOCAL_STORAGE.LASER, String(newValue));
                setLaserActive(newValue);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const ballsRef = useRef<HTMLDivElement[]>([]);
    const mouse = useRef<Position>({ x: 0, y: 0 });
    const trail = useRef<Position[]>(Array(TAIL_LENGTH).fill({ x: 0, y: 0 }));

    useEffect(() => {
        if (!laserActive) return;
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.pageX, y: e.pageY };
        };
        document.addEventListener("mousemove", handleMouseMove);

        let lastTime = 0;
        const animate = (time: number) => {
            if (time - lastTime > 16) {
                const newTrail = [...trail.current];
                newTrail[0] = { x: mouse.current.x, y: mouse.current.y };

                for (let i = 1; i < TAIL_LENGTH; i++) {
                    newTrail[i] = {
                        x: newTrail[i].x + (newTrail[i - 1].x - newTrail[i].x) * 0.3,
                        y: newTrail[i].y + (newTrail[i - 1].y - newTrail[i].y) * 0.3,
                    };
                }

                trail.current = newTrail;

                newTrail.forEach((pos, i) => {
                    const ball = ballsRef.current[i];
                    if (ball) {
                        ball.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
                    }
                });

                lastTime = time;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-[200vh] bg-gray-900 overflow-visible">
            {
                laserActive &&
                [...Array(TAIL_LENGTH)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) ballsRef.current[i] = el;
                        }}
                        className={`
                            absolute z-laser
                            rounded-full pointer-events-none 
                            transform -translate-x-1/2 -translate-y-1/2
                            red-500
                        `}
                        style={{
                            width: `${12 - i}px`,
                            height: `${12 - i}px`,
                            backgroundColor: `rgba(251,44,54,${1 - i * 0.08})`,
                            filter: `blur(${i + 1}px) brightness(1.3)`,
                            boxShadow: `0 0 ${8 + i * 2}px rgba(251,44,54,0.6)`,
                        }}
                    />
                ))
            }
            <SideBar tabletFlag={tabletFlag} sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
            <Body sidebarOpenFlag={sidebarOpenFlag} setSidebarOpenFlag={setSidebarOpenFlag} />
        </div>
    )
}