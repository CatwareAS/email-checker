import React, {useState} from 'react';

const proxyURL = "https://cors-anywhere.herokuapp.com/";
const apiURL = "http://api.quickemailverification.com/v1/verify";
const apiKeys = [
    '5c1a3796439474259d938ed7ab047a97ae476cb35a0e0abec982e88f2537'
];

function App() {

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [domain, setDomain] = useState('');
    const [emailVerifications, setEmailVerifications] = useState([]);

    const checkEmails = () => {
        checkEmail(`${firstName}.${lastName}@${domain}`, apiKeys[0]);
    }

    const checkEmail = (email, apiKey) => {

        return fetch(
            `${proxyURL}${apiURL}?apikey=${apiKey}&email=${email}`
        )
            .then(response => response.json())
            .then(response => {
                console.log('Success:', response);
                setEmailVerifications([...emailVerifications,
                    {
                        "email": response.email,
                        "name": response.user,
                        "result": response.result,
                        "success": response.success
                    }
                ]);
                return true;
            })
            .catch((error) => {
                console.error('Error:', error);
                return false;
            });
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
                <button className="btn btn-primary mr-1 mt-1" onClick={checkEmails}>Check Emails</button>
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
                    {emailVerifications.map(ev =>
                        <tr key={ev.email}>
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
