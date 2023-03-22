import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {SERVER_URL} from '../constants.js'
import Cookies from 'js-cookie';
import { useHistory } from "react-router-dom";

function wait(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000); 
  });
}

const AddAssignment = () => {
    const [dueDate, setDueDate] = useState(null)
    const [courseId, setCourseId] = useState(null)
    const [assignmentName, setAssignmentName] = useState(null)
    const [errorState, setErrorState] = useState({
        dueDate: false,
        courseId: false,
        assignmentName: false,
    })
    const history = useHistory()

    const createAssignment = async () => {
        try {
            const token = Cookies.get('XSRF-TOKEN');

            if (!dueDate || !courseId || !assignmentName) {
                setErrorState({
                    dueDate: !dueDate,
                    courseId: !courseId,
                    assignmentName: !assignmentName
                })
                 toast.error("Please fill out all fields!", {
                    position: toast.POSITION.BOTTOM_LEFT
                 });
                return;
            }

            const response = await fetch(`${SERVER_URL}/gradebook/assignment/add`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': token }, 
                body: JSON.stringify({ dueDate, assignmentName, courseId })
            })

            const data = await response.json();
            
            if (data?.status === 400) {
                throw new Error(data?.message);
            } 

            // If status is 400 and above we should throw error
            if (data?.status > 400) {
                throw new Error('Bad request from server')
            }
            
            toast.success("Assignment added, redirecting back to assignment list...", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            
            // Allow user to see toast notification
            await wait(3);

            // Redirect to home page
            history.push('/')
        } catch (e) {
            const message = e.message;

            if (message === 'Invalid course id. ') {
                toast.error("Invalid course ID, try again", {
                    position: toast.POSITION.BOTTOM_LEFT
                });
            } else {
                toast.error("Failed adding a assignment, try again", {
                    position: toast.POSITION.BOTTOM_LEFT
                });
            }
        }
    }

    const goBack = () => history.push('/')

    return (
        <div style={{ display: 'flex', alignContent: 'start', flexDirection: 'column', padding: '60px' }}>
            <Button onClick={goBack} style={{ width: "200px", margin: "5px" }} variant="text" color="primary">
                Back to gradebook
            </Button>
            <h1 style={{ textAlign: 'left' }}>Add an Assignment</h1>
            <form>
                <div style={{ display: 'flex'}}>
                    <TextField
                        style={{ width: "500px", margin: "5px" }}
                        type="text"
                        label="Enter Assignment Name"
                        variant="outlined"
                        onChange={(e) => setAssignmentName(e.target.value)}
                        value={assignmentName}
                        error={errorState['assignmentName']}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="Course ID"
                        variant="outlined"
                        onChange={(e) => setCourseId(e.target.value)}
                        value={courseId}
                        error={errorState['courseId']}
                    />                        
                    <TextField
                        id="date"
                        label="Due Date"
                        style={{ width: "200px", margin: "5px" }}
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(e) => setDueDate(e.target.value)}
                        value={dueDate}
                        error={errorState['dueDate']}
                    />
                    <Button style={{ width: "200px", margin: "5px" }} onClick={createAssignment} variant="contained" color="primary">
                        Create Assignment
                    </Button>
                </div>   
                <ToastContainer autoClose={1500} /> 
            </form>
        </div>
    )
}

export default AddAssignment;