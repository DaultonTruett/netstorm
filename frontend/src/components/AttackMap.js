import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, CircleMarker, Popup } from "react-leaflet";
import "./AttackMap.css"

import AttackWebSocket from "./AttackWebSocket";
import AttackDetailsModal from "./AttackDetailsModal";

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
    const [selectedAttack, setSelectedAttack] = useState(null);

    const [paused, setPaused] = useState(false);
    const [speed, setSpeed] = useState(1.0);
    const [maxArcs, setMaxArcs] = useState(50);
    const [filters, setFilters] = useState({
        "DDoS": true,
        "SQL Injection": true,
        "Worm": true,
        "Phishing": true,
        "Malware": true,
        "Exploit": true,
        "Ransomware": true
    });

    const handleAttack = (newAttack) => {
        setAttackFeed( (prev) => [newAttack, ...prev])
        //console.log(activeAttacks)

        setActiveAttacks((prev) => {
            const next = [...prev, {...newAttack, progress: 0, fade: 0, pulsed: false, tail: 0}
            ];
            return next.length > maxArcs ? next.slice(next.length - maxArcs) : next;
        });
    };

    useEffect( () => {
        const animationInterval = setInterval( () => {
            if (paused) return;

            setActiveAttacks( (prev) =>
                prev.map( (a) => {
                    let updatedProgress = a.progress
                    let updatedFade = a.fade ?? 1
                    let updatedTail = a.tail ?? 0;

                    if (updatedProgress < 1){
                        updatedProgress += 0.02 * speed;
                        updatedFade = Math.min(1, updatedFade + 0.05 * speed);

                    } else{
                        updatedTail += 0.03 * speed
                        updatedFade = (a.fade ?? 1) - 0.03 * speed;;

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
                    progress: p.progress + 0.08 * speed, fade: (p.fade ?? 1) - 0.05 * speed
                }))
                .filter((p) => (p.fade ?? 1) > 0)
            );
        }, 25);

        return () => clearInterval(animationInterval);
        }, [paused, speed]);


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
        <div style={{display: "flex", position: "relative", height: "100vh", width: "100vw"}}>
            <AttackWebSocket onNewAttack={handleAttack}/>
            
            <div style={{flex: 3}}>
                <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0} worldCopyJump={false} style={{ height: '100%', width: '100%'}}>
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                    maxZoom={16}
                    />
                
                {activeAttacks
                    .filter( (attacks) => !!filters[attacks.attack_type])
                    .map ((attacks, i) => {
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
            <AttackDetailsModal attack={selectedAttack} onClose={() => setSelectedAttack(null)} />
            <div style={{flex: 1, background:"#111", color: "white", padding: "1rem", overflowY: "scroll", maxHeight: "100vh"}}>
                <h2 style={{borderBottom: "1px solid gray", paddingBottom: "0.5rem"}}>
                    Log
                </h2>
                {attackFeed.map( (a, i) => (
                    <div key={i} style={{borderBottom: "1px solid #333", padding: "0.5 rem 0", cursor: "pointer"}}
                        onClick={() => setSelectedAttack(a)}
                        onMouseEnter={ (e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                        onMouseLeave={ (e) => (e.currentTarget.style.background = "transparent")}>
                        <strong style={{color: ATTACK_COLOR[a.attack_type] || "white"}}>
                            {a.attack_type}
                        </strong>
                        <div style={{fontSize: "0.75rem"}}>
                            {a.source_ip} → {a.target_ip}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                zIndex: 1000,
                background: "rgba(20,20,20,0.6)",
                padding: "0.5rem",
                borderRadius: "12px",
                backdropFilter: "blur(8px)",
                width: "250px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem"
                }}>
                    <strong style={{color:"white"}}>Controls</strong>
                    <button onClick={() => setPaused(!paused)}
                        style={{background: paused ? "#444" : "#0ea5e9", color:"#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer"}}>
                        {paused ? "Resume" : "Pause"}
                    </button>
                </div>

                <div style={{marginBottom: "0.5rem"}}>
                    <label style={{fontSize: "12px", opacity: 0.8, color: "white"}}>Speed:</label>
                    <input type="range" min="0.5" max="3" step="0.1" value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    style={{width: "100%"}}/>
                </div>

                <div style={{marginBottom: "0.5rem"}}>
                    <label style={{fontSize: "12px", opacity: 0.8, color: "white"}}>Max Arcs:</label>
                    <input type="number" min="10" max="50" value={maxArcs}
                        onChange={(e) => {
                            const val = parseInt(e.target.value || "0", 10);
                            setMaxArcs(Math.max(10, Math.min(50, val)));
                        }}
                        style={{width: 80, marginLeft: "0.5rem"}}/>
                    <button onClick={() => {setActiveAttacks([]); setPulses([]); }}
                        style={{marginLeft: 12, background:"#444", color:"#fff", border:"none", padding:"4px 8px", borderRadius:8, cursor:"pointer"}}>
                        Clear
                    </button>
                </div>

                <div>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:"0.25rem"}}>
                        <span style={{fontSize:12, opacity: 0.8, color: "white"}}>Filters</span>
                        <div style={{display:"flex", gap:"6"}}>
                            <button onClick={() => setFilters(Object.fromEntries(Object.keys(filters).map((k) => [k, true])))}
                                style={{fontSize:12}}>
                                All
                            </button>
                            <button onClick={() => setFilters(Object.fromEntries(Object.keys(filters).map((k) => [k, false])))}
                                style={{fontSize:12}}>
                                None
                            </button>
                        </div>
                    </div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
                        {Object.keys(filters).map( (type) => (
                            <label key={type} style={{fontSize:12, display:"flex", alignItems:"center", gap:6, color: "white",}}>
                                <input type="checkbox"
                                    checked={!!filters[type]}
                                    onChange={() => setFilters((prev) => ({...prev, [type]: !prev[type]}))}
                                />
                                <span style={{width: 10, height:10, borderRadius: 10, background: ATTACK_COLOR[type] || "white", display:"inline-block"}}/>
                                {type}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttackMap