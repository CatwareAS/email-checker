import React, {useState} from 'react';

const proxyURL = "https://cors-anywhere.herokuapp.com/";
const apiURL = "http://api.quickemailverification.com/v1/verify";
const apiKeys = [
    '5c1a3796439474259d938ed7ab047a97ae476cb35a0e0abec982e88f2537',
    'ebe0d5da677beb5e1acb99fb4d2ba962ef9ce50687aaf8318e808c00f476'
];
let apiCurrentKeyIndex = 1;

function App() {

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [domain, setDomain] = useState('');
    const [emailVerifications, setEmailVerifications] = useState([]);

    const checkEmails = async () => {
        // await checkEmail(`${firstName}.${lastName}@${domain}`, apiKeys[apiCurrentKeyIndex]);
        // await checkEmail(`${firstName}@${domain}`, apiKeys[apiCurrentKeyIndex]);
        // checkEmail(`${lastName}@${domain}`, apiKeys[apiCurrentKeyIndex]);

        Promise.all(
            [
                fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[1]}&email=${firstName}.${lastName}@${domain}`).then(response => response.json()),
                fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[1]}&email=${firstName}@${domain}`).then(response => response.json())
            ]
        ).then(responses => {
            console.log(responses);
            let verifications = responses.map(response => {
                return {
                    "email": response.email,
                    "name": response.user,
                    "result": response.result,
                    "success": response.success
                }
            });
            setEmailVerifications(verifications);
        });
    }

    const checkEmail = async (email, apiKey) => {
        const response = await fetch(`${proxyURL}${apiURL}?apikey=${apiKey}&email=${email}`)
            .then(response => response.json())
            .then(response => {
                return {
                    "email": response.email,
                    "name": response.user,
                    "result": response.result,
                    "success": response.success
                };
            })
            .catch((error) => {
                console.error('Error:', error);
                return false;
            });
        if (response) {
            setEmailVerifications([...emailVerifications, response]);
        }
    }

    return (
        <div className="container">
            <div className="form-inline mt-5">
                <input type="text" className="form-control mr-1 mt-1" id="firstName" value={firstName}
                       placeholder="First Name" onChange={e => setFirstName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="middleName" value={middleName}
                       placeholder="Middle Name" onChange={e => setMiddleName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="lastName" value={lastName}
                       placeholder="Last Name" onChange={e => setLastName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="domain" value={domain}
                       placeholder="Domain" onChange={e => setDomain(e.target.value)}/>
                <button className="btn btn-primary mr-1 mt-1" onClick={checkEmails}>Check Emails
                </button>
            </div>

            {
                emailVerifications.length > 0 &&

                <table className="table-light">
                    <thead>
                    <tr>
                        <th scope="col">Email</th>
                        <th scope="col">Name</th>
                        <th scope="col">Result</th>
                        <th scope="col">Success</th>
                    </tr>
                    </thead>
                    <tbody>
                    {emailVerifications.map((ev, i) =>
                        <tr key={i}>
                            <td>{ev.email}</td>
                            <td>{ev.name}</td>
                            <td>{ev.result}</td>
                            <td>{ev.success}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            }


        </div>
    );
}

export default App;
