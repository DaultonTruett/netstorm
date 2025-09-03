import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, CircleMarker, Popup } from "react-leaflet";
import "./AttackMap.css"

import AttackWebSocket from "./AttackWebSocket";

const ATTACK_COLOR = {
    "DDoS": "crimson",
    "SQL Injection": "lime",
    "Worm": "tan",
    "Phishing": "aqua",
    "Malware": "violet",
    "Exploit": "yellow",
    "Ransomware": "orange"
}


function AttackMap() {
    const [activeAttacks, setActiveAttacks] = useState([]);
    const [attackFeed, setAttackFeed] = useState([]);
    const [pulses, setPulses] = useState([]);

    const handleAttack = (newAttack) => {
        setActiveAttacks((prev) => [...prev, {...newAttack, progress: 0, fade: 0, pulsed: false, tail: 0}]);
        setAttackFeed( (prev) => [newAttack, ...prev])
        //console.log(activeAttacks)
    };

    useEffect( () => {
        const animationInterval = setInterval( () => {
            setActiveAttacks( (prev) =>
                prev.map( (a) => {
                    let updatedProgress = a.progress
                    let updatedFade = a.fade ?? 1
                    let updatedTail = a.tail ?? 0;

                    if (updatedProgress < 1){
                        updatedProgress += 0.02
                        updatedFade = Math.min(1, updatedFade + 0.05)

                    } else{
                        updatedTail += 0.03;
                        updatedFade = (a.fade ?? 1) - 0.03;

                        if (!a.pulsed){
                            setPulses((prev) => [
                                ...prev,
                                {id: `${a.id}-p1-${Date.now()}-${Math.random().toString()}`, lat: a.target_lat, lon: a.target_lon, progress: 0, fade: 1},
                                {id: `${a.id}-p2-${Date.now()}-${Math.random().toString()}`, lat: a.target_lat, lon: a.target_lon, progress: -0.015, fade: 1}
                            ]);

                            return {...a, pulsed: true, fade: updatedFade, tail: updatedTail}
                        };
                    };
                    return {...a, progress: updatedProgress, fade: updatedFade, tail: updatedTail}
                })
                .filter( (a) => (a.tail ?? 0) < 1)
            );

            setPulses((prev) => 
                prev.map((p) => ({
                    ...p,
                    progress: p.progress + 0.08, fade: (p.fade ?? 1) - 0.05
                }))
                .filter((p) => (p.fade ?? 1) > 0)
            );
        }, 25);

        return () => clearInterval(animationInterval);
        }, []);


    const createArc = ([lat1, lon1], [lat2, lon2], segments=30) => {
        const latlngs = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const curve = Math.sin(Math.PI * t) * 8.5
            const lat = lat1 + (lat2 - lat1) * t + curve;
            const lon = lon1 + (lon2 - lon1) * t;
            latlngs.push([lat, lon]);
        }
        return latlngs;
    }


    return (
        <div style={{display: "flex", height: "100vh", width: "100vw"}}>
            <AttackWebSocket onNewAttack={handleAttack}/>
            
            <div style={{flex: 3}}>
                <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0} worldCopyJump={false} style={{ height: '100%', width: '100%'}}>
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                    maxZoom={16}
                    />
                
                {activeAttacks.map ((attacks, i) => {
                    const arc = createArc(
                        [attacks.source_lat, attacks.source_lon],
                        [attacks.target_lat, attacks.target_lon],
                        100
                    );

                    const steps = Math.floor(attacks.progress * (arc.length - 1));

                    const tailIndex = Math.floor( (attacks.tail ?? 0) * (arc.length - 1))
                    const partialArc = arc.slice(tailIndex, steps + 1);
                    const curPoint = arc[steps];

                    const color = ATTACK_COLOR[attacks.attack_type]
                    const opacity = attacks.fade ?? 1;

                    return (
                        <div key={attacks.id || i}>
                            <Polyline positions={partialArc}
                            pathOptions={ {
                                color: color,
                                weight: 8,
                                opacity: opacity * 0.3,
                                className: 'glow-arc'
                            } }/>
                            <Polyline positions={partialArc}
                            pathOptions={{
                                color: color,
                                weight: 3,
                                opacity: opacity
                            }}/>
                            {curPoint && attacks.progress < 1 &&(
                                <CircleMarker
                                center={curPoint}
                                radius={2.5}
                                pathOptions={{
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: opacity
                                }}/>
                            )}
                        </div>
                    );
                })}
                {pulses.map((pulse) => {
                    const radius = 5 + pulse.progress * 11;
                    return (
                        <CircleMarker
                        
                        key={pulse.id}
                        center={[pulse.lat, pulse.lon]}
                        radius={radius}
                        pathOptions={{
                            color: 'white',
                            opacity: (pulse.fade ?? 1),
                            weight: 2.5
                        }}/>
                    );
                })};
                </MapContainer>
            </div>
            <div style={{flex: 1, background:"#111", color: "white", padding: "1rem", overflowY: "scroll", maxHeight: "100vh"}}>
                <h2 style={{borderBottom: "1px solid gray", paddingBottom: "0.5rem"}}>
                    Log
                </h2>
                {attackFeed.map( (a, i) => (
                    <div key={i} style={{borderBottom: "1px solid #333", padding: "0.5 rem 0"}}>
                        <strong style={{color: ATTACK_COLOR[a.attack_type] || "white"}}>
                            {a.attack_type}
                        </strong>
                        <div style={{fontSize: "0.75rem"}}>
                            {a.source_ip} → {a.target_ip}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AttackMap