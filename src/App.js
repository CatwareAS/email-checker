import React, {useEffect, useState} from 'react';

const proxyURL = "https://cors-anywhere.herokuapp.com/";
const apiURL = "http://api.quickemailverification.com/v1/verify";
const apiKeys = [
    '5c1a3796439474259d938ed7ab047a97ae476cb35a0e0abec982e88f2537',
    'ebe0d5da677beb5e1acb99fb4d2ba962ef9ce50687aaf8318e808c00f476',
    '8867e52efd8e1ebda08b048e2c1a69c3b1ae4dda514bcfacc4cc90f1dc36',
    '95df0b1bfac0011bf164a040dc665ed6ea8ed9ddf448b29b1c35b7abbe09',
    'cbc1f1ab40765c11bcb7295f80909efbf880f65595fabae39bee377a0e08',
    '2727d96fcca3fde74c3778175ea96abbbcc4541091fd05bfd0459058adfb',
    '72689db39afa77030a8d1f36566a733f51b80414f6eff829f0a100aa5b12',
    'bb03c936a946f9b386b20416ab1006b78a7968dc70f017c834c4ad8a8a09',
    '68ff563abbb8e56dcc120bf4e929df5821c9fedb613bfa4e978442ddbb7c'
];
const SINGLE_EMAIL = 'SINGLE_EMAIL';
const MULTIPLE_EMAILS = 'MULTIPLE_EMAILS';

function App() {

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [restartCheckFor, setRestartCheckFor] = useState(MULTIPLE_EMAILS);
    const [emailVerifications, setEmailVerifications] = useState([]);
    const [apiCurrentKeyIndex, setApiCurrentKeyIndex] = useState(0);

    /**
     * {
        "result": "valid",
        "reason": "accepted_email",
        "disposable": "false",
        "accept_all": "false",
        "role": "false",
        "free": "false",
        "email": "Rolf.Thu@aarbakke.no",
        "user": "Rolf.Thu",
        "domain": "aarbakke.no",
        "mx_record": "aarbakke-no.mail.protection.outlook.com",
        "mx_domain": "outlook.com",
        "safe_to_send": "true",
        "did_you_mean": "",
        "success": "true",
        "message": ""
        }
     */

    useEffect(() => {
        console.log('useEffect, restartCheckFor: ' + restartCheckFor);
        if (apiCurrentKeyIndex >= apiKeys.length) {
            console.log('All keys used for today');
            return;
        }
        if (restartCheckFor === MULTIPLE_EMAILS) {
            checkEmails();
        } else if (restartCheckFor === SINGLE_EMAIL) {
            checkEmail();
        } else {
            console.log(`ERROR! restartCheckFor has strange value: ${restartCheckFor}`);
        }
    }, [apiCurrentKeyIndex]);

    const generateEmailsCombinations = (firstName, middleName, lastName, domain) => {
        let result = [];
        if (middleName.trim()) {
            result.push(`${firstName}.${middleName}.${lastName}@${domain}`);
            result.push(`${firstName.substr(0, 1)}${lastName}@${domain}`);
        } else {
            result.push(`${firstName.substr(0, 1)}${lastName}@${domain}`);
        }
        result.push(`${firstName}${lastName.substr(0, 1)}@${domain}`);
        result.push(`${firstName}.${lastName}@${domain}`);
        result.push(`${firstName}@${domain}`);
        result.push(`${lastName}@${domain}`);
        result.push(`${firstName.substr(0, 2)}${lastName.substr(0, 2)}@${domain}`);
        result.push(`${firstName.length > 2 ? firstName.substr(0, 3) : firstName}${lastName.length > 2 ? lastName.substr(0, 3) : lastName}@${domain}`);
        return result;
    }

    const checkEmails = () => {

        if (firstName.trim().length === 0 || lastName.trim().length === 0 || domain.trim().length === 0) {
            console.log('Invalid Input');
            return;
        }

        let emails = generateEmailsCombinations(firstName, middleName, lastName, domain);

        Promise.all(
            emails.map(e => fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${e}`).then(response => response.json()))
        )
            .then(responses => {
                if (responses.find(v => v.success === 'false')) {
                    setRestartCheckFor(MULTIPLE_EMAILS);
                    console.log('Increasing apiCurrentKeyIndex');
                    setApiCurrentKeyIndex(apiCurrentKeyIndex + 1);
                    console.log('apiCurrentKeyIndex:' + apiCurrentKeyIndex);
                    console.log('Calling checkEmails again');
                    return;
                }
                setEmailVerifications(responses);
            });
    }

    const checkEmail = () => {
        if (email.trim().length === 0) {
            console.log('Invalid Input');
            return;
        }

        fetch(`${proxyURL}${apiURL}?apikey=${apiKeys[apiCurrentKeyIndex]}&email=${email}`)
            .then(response => response.json())
            .then(response => {
                if (response.success === 'false') {
                    setRestartCheckFor(SINGLE_EMAIL);
                    setApiCurrentKeyIndex(apiCurrentKeyIndex + 1);
                }
                setEmailVerifications([response, ...emailVerifications]);
            })
    }

    return (
        <div className="container">

            {(apiCurrentKeyIndex >= apiKeys.length) &&
            <div className="alert alert-danger mt-5 mb-3 text-center" role="alert">
                <h1>You have used all your free quota for today</h1>
            </div>
            }

            <div className="form-inline mt-5 mb-3">
                <input type="text" className="form-control mr-1 mt-1" id="firstName" value={firstName}
                       placeholder="First Name" onChange={e => setFirstName(e.target.value)}/>
                <input type="text" className="form-control mr-1 mt-1" id="middleName" value={middleName}
                       placeholder="Middle Name" onChange={e => setMiddleName(e.target.value)}/>
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
                        <th scope="col">Result</th>
                        <th scope="col">Reason</th>
                        <th scope="col">Disposable</th>
                        <th scope="col">Accept All</th>
                        <th scope="col">Role</th>
                        <th scope="col">Free</th>
                        <th scope="col">Success</th>
                    </tr>
                    </thead>
                    <tbody>
                    {emailVerifications.map((ev, i) =>
                        <tr key={i}>
                            <td className="table-success">{ev.email}</td>
                            <td className="table-success">{ev.domain}</td>

                            <td className={ev.result === "valid" ? "table-success" : "table-danger"}>{ev.result}</td>
                            <td className={ev.reason === "accepted_email" ? "table-success" : "table-danger"}>{ev.reason}</td>
                            <td className={ev.disposable === "false" ? "table-success" : "table-danger"}>{ev.disposable}</td>
                            <td className={ev.accept_all === "false" ? "table-success" : "table-danger"}>{ev.accept_all}</td>
                            <td className={ev.role === "false" ? "table-success" : "table-danger"}>{ev.role}</td>
                            <td className={ev.free === "false" ? "table-success" : "table-danger"}>{ev.free}</td>
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
