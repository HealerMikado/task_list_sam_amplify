import { Button, Form, Row, Col } from "react-bootstrap";
import {getToken} from "../App"
import axios from 'axios';

function SubmitTask({ updateTask }) {
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(e.target)
      axios.post("/tasks",
        {
          title: e.target.title.value,
          body: e.target.body.value,
          dueDate: e.target.dueDate.value,
        },
        { headers: { Authorization: getToken() } })
        .then((res) => {
          console.log(JSON.stringify(res.data, null, 2));
          updateTask()
        })
  
    }
    return (
      <Form onSubmit={e => { handleSubmit(e) }}>
        <Row>
          <Col>
            <Form.Group controlId="taskTile">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Title" name="title" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="taskBody">
              <Form.Label>Body</Form.Label>
              <Form.Control type="text" placeholder="Body" name="body" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="taskDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control type="date" label="Due date" name="dueDate" />
            </Form.Group>
          </Col>
          <Col className="d-flex">
  
            <Button variant="primary" type="submit" className='align-self-end' >
              Submit
            </Button>
          </Col>
        </Row>
  
      </Form>
  
    );
  }

export default SubmitTask;