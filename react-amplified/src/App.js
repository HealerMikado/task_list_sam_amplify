import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify, Auth } from 'aws-amplify';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {Container } from 'react-bootstrap';
import './App.css';
import awsconfig from './aws-exports';
import Header from './components/header';
import ListTask from './components/tasksList';
import SubmitTask from './components/submitTask';

const AUTH_TOKEN_KEY = 'authToken'

Amplify.configure(awsconfig);


export function getToken(){
  return localStorage.getItem(AUTH_TOKEN_KEY) 
}

/**
 * The main component.
 * 
 */
function App({ signOut, user }) {
  const [tasks, setTasks] = useState([]);

  const fetchTask = async () => {
    axios.get("/tasks", { headers: { Authorization: localStorage.getItem(AUTH_TOKEN_KEY) } })
      .then(res => {
        console.log(res.data)
        setTasks(res.data)

      });
  }

  useEffect(() => {
    const fetchJwtToken = async () => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        localStorage.setItem(AUTH_TOKEN_KEY, idToken)
        console.log(idToken)
      } catch (error) {
        console.error('Failed to fetch JWT token:', error);
      }
    };
    fetchJwtToken();
    fetchTask()
  }, []);

  return (
    <Container>
      <Header user={user}/>

      <SubmitTask updateTask={fetchTask} />
      <ListTask tasks={tasks} updateTask={fetchTask} />
    </Container>
  );
};





export default withAuthenticator(App)