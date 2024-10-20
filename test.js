// import os from 'os';

// export default function getLocalIPAddress() {
//     const networkInterfaces = os.networkInterfaces();
//     let ipAddress = '';

//     // Loop through network interfaces
//     for (const interfaceName in networkInterfaces) {
//         const addresses = networkInterfaces[interfaceName];
//         for (const address of addresses) {
//             if (address.family === 'IPv4' && !address.internal) {
//                 ipAddress = address.address;
//                 break;
//             }
//         }
//         if (ipAddress) {
//             break;
//         }
//     }

//     return ipAddress;
// }

// console.log('Local IP Address:', getLocalIPAddress());
export default function getLocalIP() {
    return new Promise((resolve, reject) => {
        // Create a new RTCPeerConnection object (WebRTC)
        const peerConnection = new RTCPeerConnection({
            iceServers: []
        });

        // Create a data channel (we don’t need to use this)
        peerConnection.createDataChannel('');

        // Listen for ICE candidates (network interfaces)
        peerConnection.onicecandidate = event => {
            if (event && event.candidate && event.candidate.candidate) {
                // Match the IP address from the ICE candidate string
                const candidate = event.candidate.candidate;
                const ipMatch = candidate.match(
                    /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/
                );
                if (ipMatch) {
                    resolve(ipMatch[1]);
                    peerConnection.close(); // Close connection after retrieving IP
                }
            }
        };

        // Create an offer to trigger the ICE candidate gathering
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .catch(error => reject(error));
    });
}
getLocalIP().then(ipAddress => {
    console.log('Local IP Address:', ipAddress);
}).catch

// fetch('https://api.ipify.org?format=json')
//     .then(response => response.json())
//     .then(data => {
//         console.log('Public IP Address:', data.ip);
//     })
//     .catch(error => console.error('Error fetching public IP:', error));
