export class HandShake {
    client_id = ''
    token = ''
    sign = ''

    toString() {
        return JSON.stringify(this)
    }
}

// export class Call {
//     type = 'webrtc'
//     message = {
//         is_group: false,
//         source_id: '',
//         destination_id: '',
//         identity: {
//             client_id: '',
//             sign: ''
//         },
//         message_detail: {
//             message_model: {
//                 call_id: '',
//                 call_from: '',
//                 call_to: '',
//                 call_status: '',
//                 start_call: 0,
//                 end_call: 0,
//                 duration: 0,
//                 is_reject: 0,
//                 name: '',
//                 phone: '',
//                 image: '',
//                 code: ''
//             }
//         }
//     }

//     toString() {
//         return JSON.stringify(this)
//     }
// }