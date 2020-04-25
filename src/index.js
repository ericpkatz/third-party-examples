import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import qs from 'qs';
import Calendar from './Calendar';
import Map from './Map';
const root = document.querySelector('#root');


const App = ()=> {
  const [auth, setAuth] = useState({ });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);

  const createEvent = (date)=> {
    const token = window.localStorage.getItem('token');
    axios.post('/api/events', {startTime: date, name: `${auth.username} Event ${Math.random()}`}, {
      headers: {
        authentication: token
      }
    })
    .then( response => setEvents([...events, response.data ]));
  };

  const onSubmit = async(ev)=> {
    ev.preventDefault();
    const credentials = {
      username,
      password
    };
    axios.post('/api/auth', credentials)
      .then( response => {
        window.localStorage.setItem('token', response.data.token);
        attemptLoginFromToken();
      })
      .catch( ex => setError(ex.response.data.message));
  };

  useEffect(()=> attemptLoginFromToken(), []);

  useEffect(()=> {
    if(auth.id){
      const token = window.localStorage.getItem('token');
      if(!token){
        return;
      }
      axios.get('/api/events', {
        headers: {
          authentication: token
        }
      })
      .then(response => setEvents(response.data));
    }
  }, [auth]);

  useEffect(()=> {
    if(auth.id){
      const token = window.localStorage.getItem('token');
      if(!token){
        return;
      }
      axios.get('/api/users', {
        headers: {
          authentication: token
        }
      })
      .then(response => setUsers(response.data));
    }
  }, [auth]);

  const attemptLoginFromToken = ()=> {
    const token = window.localStorage.getItem('token');
    if(!token){
      return;
    }
    axios.get('/api/auth', {
      headers: {
        authentication: token
      }
    })
    .then(response => setAuth(response.data));

  };

  const logout = ()=> {
    window.localStorage.removeItem('token');
    setAuth({});
  };

  return (
    <div>
      <h1>Auth App ({ events.length })</h1>
      {
        !auth.id &&  (
          <form onSubmit={ onSubmit }>
            <h2>Login</h2>
            <div className='error'>{ error }</div>
            <input value={ username } onChange={ ev => setUsername(ev.target.value )}/>
            <input type='password' value={ password } onChange={ ev => setPassword(ev.target.value )}/>
            <button>Save</button>
          </form>
        )
      }
      {
        auth.id && <button onClick={ logout }>Logout { auth.username }</button>
      }
      {
        auth.id && <Map users={ users } auth={ auth }/>
      }
      {
        auth.id && <Calendar events={ events } createEvent={ createEvent }/>
      }
    </div>
  );
};

render(<App />, root); 
