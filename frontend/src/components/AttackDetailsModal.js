import React from 'react';
import './AttackDetailsModal.css'

export default function AttackDetailsModal({ attack, onClose }) {
    if (!attack) return null;
    
    const date = new Date().toDateString();
    const time = new Date().toTimeString();
    const start = `${date} ${time}`;

    return (
        <div className='backdrop' onClick={onClose}>
            <div className='modal' onClick={(e) => e.stopPropagation()}>

                <div className='modal-header'>
                    <strong>Attack Details</strong>
                    <button onClick={onClose} className='closeBtn'>&times;</button>
                </div>

                <div className='modal-content'>
                    <div className='row'>
                        <span>Type: </span>
                        <strong>{attack.attack_type}</strong>
                    </div>

                    <div className='row'>
                        <span>Source IP: </span>
                        <strong>{attack.source_ip}</strong>
                    </div>
                    <div className='row'>
                        <span>Source Lat/Lon: </span>
                        <strong>{attack.source_lat} / {attack.source_lon}</strong>
                    </div>

                    <div className='row'>
                        <span>Target IP: </span>
                        <strong>{attack.target_ip}</strong>
                    </div>
                    <div className='row'>
                        <span>Target lat/Lon: </span>
                        <strong>{attack.target_lat} / {attack.target_lon}</strong>
                    </div>

                    <div className='row'>
                        <span>Start Date/Time: </span>
                        <strong>{start}</strong>
                    </div>

                    <div className='infographic'>
                        <p>Severity, Country data, and distance details coming soon!</p>

                        <div className='barLabel'>
                            Severity
                        </div>
                        <div className='barTrack'>
                            <div className='barFill'></div>
                        </div>
                        <div className='summary'>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )

}
