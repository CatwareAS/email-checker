import React, {useEffect, useState} from 'react';

const proxyURL = "https://cors-anywhere.herokuapp.com/";
const apiURL = "http://api.quickemailverification.com/v1/verify";
const apiKeys = [
    '5c1a3796439474259d938ed7ab047a97ae476cb35a0e0abec982e88f2537',
    'ebe0d5da677beb5e1acb99fb4d2ba962ef9ce50687aaf8318e808c00f476',
    '8867e52efd8e1ebda08b048e2c1a69c3b1ae4dda514bcfacc4cc90f1dc36'
];
const SINGLE_EMAIL = 'SINGLE_EMAIL';
const MULTIPLE_EMAILS = 'MULTIPLE_EMAILS';

function App() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [restartCheckFor, setRestartCheckFor] = useState(MULTIPLE_EMAILS);
    const [emailVerifications, setEmailVerifications] = useState([]);
    const [apiCurrentKeyIndex, setApiCurrentKeyIndex] = useState(0);

    useEffect(() => {
        console.log('useEffect, restartCheckFor: ' + restartCheckFor);
        if (restartCheckFor === MULTIPLE_EMAILS) {
            checkEmails();
        } else if (restartCheckFor === SINGLE_EMAIL) {
            checkEmail();
        } else {
            console.log(`ERROR! restartCheckFor has strange value: ${restartCheckFor}`);
        }
    }, [apiCurrentKeyIndex]);

    const mapResponse = response => {
        return {
            "email": response.email,
            "domain": response.domain,
            "result": response.result,
            "reason": response.reason,
            "acceptAll": response.accept_all,
            "safeToSend": response.safe_to_send,
            "success": response.success
        }
    }

    const checkEmails = () => {

        if (firstName.trim().length === 0 || lastName.trim().length === 0 || domain.trim().length === 0) {
            console.log('Invalid Input');
            return;
        }

        Promise.all(
            [
                //First name and Last name
                fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${firstName}.${lastName}@${domain}`).then(response => response.json()),
                //First name
                // fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${firstName}@${domain}`).then(response => response.json()),
                //Last name
                // fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${lastName}@${domain}`).then(response => response.json()),
                //First two letters of first name, first two letters of last name
                // fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${firstName.substr(0, 2)}${lastName.substr(0, 2)}@${domain}`).then(response => response.json()),
                //First three letters of first name, first three letters of last name
                // fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${firstName.length > 2 ? firstName.substr(0, 3) : firstName}${lastName.length > 2 ? lastName.substr(0, 3) : lastName}@${domain}`).then(response => response.json())
            ]
        )
            .then(responses => {
                let verifications = responses.map(response => mapResponse(response));
                if (verifications.find(v => v.success === 'false')) {
                    setRestartCheckFor(MULTIPLE_EMAILS);
                    console.log('Increasing apiCurrentKeyIndex');
                    setApiCurrentKeyIndex(apiCurrentKeyIndex + 1);
                    console.log('apiCurrentKeyIndex:' + apiCurrentKeyIndex);
                    console.log('Calling checkEmails again');
                    return;
                }
                setEmailVerifications(verifications);
            });
    }

    const checkEmail = () => {
        if (firstName.trim().length === 0) {
            console.log('Invalid Input');
            return;
        }

        fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${email}`)
            .then(response => response.json())
            .then(response => {
                let verification = mapResponse(response);
                if (verification.success === 'false') {
                    setRestartCheckFor(SINGLE_EMAIL);
                    setApiCurrentKeyIndex(apiCurrentKeyIndex + 1);
                }
                setEmailVerifications([verification, ...emailVerifications]);
            })
    }

    return (
        <div className="container">
            <div className="form-inline mt-5 mb-3">
                <input type="text" className="form-control mr-1 mt-1" id="firstName" value={firstName}
                       placeholder="First Name" onChange={e => setFirstName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="lastName" value={lastName}
                       placeholder="Last Name" onChange={e => setLastName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="domain" value={domain}
                       placeholder="Domain" onChange={e => setDomain(e.target.value)}/>
                <button className="btn btn-primary mr-1 mt-1" onClick={checkEmails}>Check Emails</button>
            </div>

            <div className="form-inline mt-5 mb-3">
                <input type="email" className="form-control mr-1 mt-1" id="email" value={email}
                       placeholder="Email" onChange={e => setEmail(e.target.value)}/>
                <button className="btn btn-primary mr-1 mt-1" onClick={checkEmail}>Check Single Email</button>
            </div>

            {
                emailVerifications.length > 0 &&

                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Email</th>
                        <th scope="col">Domain</th>
                        <th scope="col">Reason</th>
                        <th scope="col">Result</th>
                        <th scope="col">Accept All</th>
                        <th scope="col">Safe To Send</th>
                        <th scope="col">Success</th>
                    </tr>
                    </thead>
                    <tbody>
                    {emailVerifications.map((ev, i) =>
                        <tr key={i}>
                            <td className="table-success">{ev.email}</td>
                            <td className="table-success">{ev.domain}</td>
                            <td className={ev.reason === "accepted_email" ? "table-success" : "table-danger"}>{ev.reason}</td>
                            <td className={ev.result === "valid" ? "table-success" : "table-danger"}>{ev.result}</td>
                            <td className={ev.acceptAll === "false" ? "table-success" : "table-danger"}>{ev.acceptAll}</td>
                            <td className={ev.safeToSend === "true" ? "table-success" : "table-danger"}>{ev.safeToSend}</td>
                            <td className={ev.success === "true" ? "table-success" : "table-danger"}>{ev.success}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            }


        </div>
    );
}

export default App;
