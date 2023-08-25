const Config = {
    clientId: "11fef4062cfd424c90ce6c4a98782525",
    sign: '7d787fcfbceb42b7a6ce98286f83ce5c',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiIxMWZlZjQwNjJjZmQ0MjRjOTBjZTZjNGE5ODc4MjUyNSIsInJlc291cmNlIjoiY2hhdCBjYXJlIiwic2NvcGUiOiJyZWFkIHdyaXRlIiwibG9jYWxlIjoiaWQtSUQiLCJleHAiOjE2OTMwMzQxNjgsImp0aSI6IjUxNjYyNGU4YTIzNjRkNDM4OTlkMGEzYWE2MTI1ZjljIiwiaWF0IjoxNjkyOTQ3NzY4LCJzdWIiOiI0ODgwMDQifQ.9WIbZ7NW-Q8qS9Q_5zdlOCoYmZ7cGpVikAk4qxmx6Xa77ywmjoOattg-MB2cys30RS2_OSSbRH5oCLLWb60IAw',
    profile: {
        name: 'CS NexCare 4',
        phone: '+6289898000004',
        image: 'https://yt3.ggpht.com/gVaajm86B_dxV7f2s6aOcFqPekQcmjnF7XHpWgD7_xCVAfdsxIUIlxLm79dhPtqe5XnRBgeihWkmRA=s800-nd-v1'
    },
    iceServers: {
        iceServers: [
            { urls: 'stun:voip.gromart.club:3478' },
            { 
                urls: 'turn:voip.gromart.club:5349',
                username: 'gorst',
                credential: 'hero'
            },
        ]
    }
}

export default Config