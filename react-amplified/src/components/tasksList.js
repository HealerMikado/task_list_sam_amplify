import { useEffect, useState } from "react";
import Task from "./task";
import { Row } from "react-bootstrap";


function ListTask({ tasks, updateTask }) {
    const [taskss, setTaskss] = useState(tasks);

    const removeTaskFromList = async (taskId) => {
      const tasksFiltered = tasks.filter((task) => task.id !== taskId);
      setTaskss(tasksFiltered)
    }

    useEffect(() => {
        setTaskss(tasks);
      }, [tasks]);
    return (
      <Row xs={1} md={2} className="g-4">
        {taskss.map((task) => (
          <Task key={task.id} task={task} removeTask={removeTaskFromList} updateTask={updateTask} />
        )
        )}
      </Row>
    )
  }
  
export default ListTask;
  