import { Badge, Card, Col, ListGroup, CloseButton, Button, ProgressBar } from "react-bootstrap";
import React, { useEffect, useState } from 'react';
import { getToken } from "../App"
import axios from 'axios';

function Task({ task, removeTask, updateTask }) {
    const [showCard, setShowCard] = useState(true);
    const [attachment, setAttachment] = useState(null);
    const [image, setImage] = useState(null);
    const [labeling, setLabeling] = useState(null)

    const fileChanged = (e) => {
        const files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        console.log(files[0]);
        setAttachment(files[0]);
    }
    const getSignedUrlPut = async (taskId) => {
        console.log("Getting signed URL");
        console.log(attachment.name)
        const config = {
            headers: { Authorization: getToken() },
            params: {
                filename: attachment.name,
                filetype: attachment.type,
                taskId: taskId,
            },
        };

        const response = await axios.get("/signedUrlPut", config);
        return new URL(response.data.uploadURL);
    }
    const submitFile = async () => {
        if (!attachment) {
            alert("Please select a file to upload.");
        }
        const taskId = task.id.split("#")[1];
        const uploadUrl = await getSignedUrlPut(taskId);

        const config = {
            headers: { "Content-Type": attachment.type },
        };
        console.log(`Uploading to S3: ${uploadUrl}`);

        var instance = axios.create();
        delete instance.defaults.headers.common['Authorization'];
        setLabeling(true)

        const res = await instance.put(uploadUrl, attachment, config)
        setTimeout(() => {
            console.log(res.status); // HTTP status
            setLabeling(false)
            updateTask()
          }, 2000);


    }

    const deleteTask = async () => {
        const id = task.id.split("#")[1];
        console.log(`/tasks/${task.id}`)
        try {
            axios.delete(`/tasks/${id}`, { headers: { Authorization: getToken() } })
                .then(res => {
                    console.log(task.id);
                    setShowCard(false);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const getImage = async () => {
        console.log(`Getting signed URL for post id ${task.id}`);

        const regex = /^s3:\/\/([^/]+)\/(.+)$/;
        const match = regex.exec(task.upload);

        if (!match) {
            console.error('Invalid S3 URI:', task.upload);
        }
        const bucket = match[1];
        const objectKey = match[2];

        console.log('Bucket:', bucket);
        console.log('Object key:', objectKey);


        const config = {
            headers: { Authorization: getToken() },
            params: {
                objectKey: objectKey,
            },
        };

        const response = await axios.get("/signedUrlGet", config);
        setImage(response.data.downloadURL)
    }
    useEffect(() => {
        console.log(`Creating task id ${task.id}`);
        if (task.upload){
            getImage()
        }
    }, [task])

    return (<>
        {showCard && (
            <Col>
                <Card style={{ marginTop: '1rem', }} key={task.id}>
                    <Card.Header >{task.title} <CloseButton className="float-end" onClick={deleteTask} /></Card.Header>
                    <Card.Img variant="top" src={image} />
                    <Card.Body>
                        <Card.Text>
                            {task.body}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>Create At:  : {task.createdAt}</ListGroup.Item>
                        <ListGroup.Item>Due Date : {task.dueDate}</ListGroup.Item>
                        {task.labels
                            ?
                            <ListGroup.Item>

                                {task.labels.map((label) => (
                                    <Badge key={label} bg="info">
                                        {label}
                                    </Badge>
                                ))}{' '}
                            </ListGroup.Item>
        
                            : 
                            <ListGroup.Item>
                                Attachment:
                                <input type="file" onChange={fileChanged} />
                                <Button
                                    variant="primary"
                                    onClick={submitFile}
                                >
                                    Upload
                                </Button>
                                {labeling &&
                                <ProgressLabeling/>
                                }
                            </ListGroup.Item>
                            }
                    </ListGroup>
                </Card>
            </Col>
        )}
    </>
    )
}

function ProgressLabeling() {
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      const timer = setInterval(() => {
        if (progress < 100) {
          setProgress(progress + 1);
        }
      }, 10);
  
      return () => {
        clearInterval(timer);
      };
    }, [progress]);
  
    return (
      <div className="App">
        <ProgressBar now={progress} label="Detecting labels" />
      </div>
    );
  }
  


export default Task