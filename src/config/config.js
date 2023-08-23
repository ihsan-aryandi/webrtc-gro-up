const Config = {
    clientId: "11fef4062cfd424c90ce6c4a98782525",
    sign: '7d787fcfbceb42b7a6ce98286f83ce5c',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiIxMWZlZjQwNjJjZmQ0MjRjOTBjZTZjNGE5ODc4MjUyNSIsInJlc291cmNlIjoiY2hhdCBjYXJlIiwic2NvcGUiOiJyZWFkIHdyaXRlIiwibG9jYWxlIjoiaWQtSUQiLCJleHAiOjE2OTI4NjYwNjcsImp0aSI6ImRhYTMzODg1ZTU3YzQ0MGM5OGQxNWM1NWViYWYyMmM2IiwiaWF0IjoxNjkyNzc5NjY3LCJzdWIiOiI0ODgwMDQifQ.Y32xfMQN0cPrZeNvu-W23AqKVv5_KnJLhZQtcVJWjkT0OvphXrvl2MxQfzIox6at_3K3wduTxSY6_qRVj3B3xA',
    profile: {
        name: 'CS NexCare 4',
        phone: '+6289898000004'
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