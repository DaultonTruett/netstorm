import { useEffect, useState } from 'react'

const AttackWebSocket = ({onNewAttack}) => {
    useEffect( () => {
        const socket = new WebSocket('ws://127.0.0.1:8000/ws/attacks/')

        socket.onopen = () => {
            console.log('Connected to web socket')
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('Attack received: ', data)
            onNewAttack(data)
        }

        socket.onclose = () => {
            console.log('Disconnected from socket')
        }

        socket.onerror = (error) => {
            console.log('Error: ', error)
        }

        return () => {
            socket.close()
        }
    }, [])
}

export default AttackWebSocket;