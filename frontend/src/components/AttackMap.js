import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Tooltip } from "react-leaflet";
import axios from "axios";

function AttackMap() {
    const [attacks, setAttacks] = useState([]);

    useEffect( () => {
        axios.get('http://localhost:8000/api/attacks/?limit=50')
        .then( (res) => {
            setAttacks(res.data.results || res.data)
        })
        .catch( (err) => console.error(err) );
    }, []);

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100vh', width: '100vw'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {attacks.map ((attacks, i) => (
            <Polyline
                key={i}
                positions={[
                    [attacks.source_lat, attacks.source_lon],
                    [attacks.target_lat, attacks.target_lon],
                ]}
                color="red">
                <Tooltip>
                    {attacks.attack_type} <br />
                    from {attacks.source_ip} → {attacks.target_ip}
                </Tooltip>
            </Polyline>
        ))}
        </MapContainer>
    )
}

export default AttackMap