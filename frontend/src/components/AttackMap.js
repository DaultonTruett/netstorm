import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip, CircleMarker } from "react-leaflet";
import axios from "axios";

const ATTACK_COLOR = {
    "DDoS": "red",
    "SQL Injection": "green",
    "Worm": "brown",
    "Phishing": "blue",
    "Malware": "purple",
    "Exploit": "yellow",
    "Ransomware": "orange"
}


function AttackMap() {
    const [attacks, setAttacks] = useState([]);
    const [activeAttacks, setActiveAttacks] = useState([]);
    const [attackFeed, setAttackFeed] = useState([]);

    useEffect( () => {
        axios.get('http://localhost:8000/api/attacks/?limit=50')
        .then( (res) => {
            setAttacks(res.data.results || res.data)
        })
        .catch( (err) => console.error(err) );
    }, []);


    useEffect ( () => {
        if (attacks.length === 0) return;

        const createInterval = setInterval( () => {
            const newAttack = attacks[Math.floor(Math.random() * attacks.length)];
            setActiveAttacks( (prev) => [
                ...prev,
                {...newAttack, progress: 0}
            ]);

            setAttackFeed ( (prev) => [
                newAttack, ...prev
            ])
        }, 5000);

        return () => clearInterval(createInterval);
    }, [attacks]);


    useEffect( () => {
        const animationInterval = setInterval( () => {
            setActiveAttacks( (prev) =>
                prev.map( (a) => ({...a, progress: a.progress + 0.02 }))
                .filter( (a) => a.progress <= 1)
            );
            }, 50);

        return () => clearInterval(animationInterval);
        }, []);


    const createArc = ([lat1, lon1], [lat2, lon2], segments=30) => {
        const latlngs = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const lat = lat1 + (lat2 - lat1) * t + Math.sin(Math.PI * t) * 10;
            const lon = lon1 + (lon2 - lon1) * t;
            latlngs.push([lat, lon]);
        }
        return latlngs;
    }


    return (
        <div style={{display: "flex", height: "100vh", width: "100vw"}}>
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
                        40, 3
                    );

                    const steps = Math.floor(attacks.progress * (arc.length - 1));
                    const partialArc = arc.slice(0, steps + 1);
                    const curPoint = arc[steps];
                    const color = ATTACK_COLOR[attacks.attack_type]

                    return (
                        <div key={i}>
                            <Polyline positions={partialArc} color={color} opacity={0.7}/>
                            {curPoint && (
                                <CircleMarker center={curPoint} radius={2} color={color}/>
                            )}
                        </div>
                    );
                })}
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