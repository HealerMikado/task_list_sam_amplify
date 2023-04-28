import { Accordion } from "react-bootstrap";
import LogoutButton from "../LogOut";
import {getToken} from "../App"


function Header({user}) {

    return(
        <>
        <h1>Basic Task App</h1>
        <p>This little application is just a personnal project to learn how to use
          Amazon Serverless Model (SAM) and Amazon Amplify. The code idea of this app 
          is to reproduce this{' '}
          <a href='https://catalog.us-east-1.prod.workshops.aws/workshops/841ce16b-9d86-48ac-a3f6-6a1b29f95d2b/en-US'>workshop</a> 
          {' '}from AWS with python instead of node for the lambdas source code, and ReactJs
          instead of VueJs. I choose to add a authentification layer with AWS Congnito too.
        </p>
        <LogoutButton />
        <p>Welcome back : {user.username}</p>
        <Accordion>
          <Accordion.Item eventKey='0'>
            <Accordion.Header>Your Acces Token</Accordion.Header>
            <Accordion.Body>
              {getToken() }
  
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        </>
    )
}

export default Header;
