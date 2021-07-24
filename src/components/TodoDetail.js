import React, { useState, useEffect } from 'react'
import {Spinner} from 'react-bootstrap'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {API_URL} from '../config'
import {Redirect} from 'react-router-dom'


function TodoDetail(props) {

    const [todoDetail, updateTodoDetail] = useState(null)

    useEffect(() => {
        const getData = async () => {
            try {
                //check the `<Routes>` in App.js. That's where the params `todoId` comes from
                let todoId = props.match.params.todoId
                let response = await axios.get(`${API_URL}/api/todos/${todoId}`)
                updateTodoDetail(response.data)
            }  
            catch(err){
                console.log('Todo fetch failed', err)
            }
        }
        getData()
    }, [])

    if (!props.user) {
        //redirect to signin page 
        return <Redirect to={'/signin'} />
    }


    if (!todoDetail) {
        return <Spinner animation="border" variant="primary" />
    } 

    return (
        <div>
            <h4>
                Name: {todoDetail.name}
            </h4>
            <h6>
                Description: {todoDetail.description}
            </h6>
            {
                todoDetail.image && (
                    <img src={todoDetail.image} alt={todoDetail.name} />
                )
            }
            
            <Link to={`/todo/${todoDetail._id}/edit`}>
                <button  >
                    Edit 
                </button>
            </Link>
            <button onClick={() => { props.onDelete( todoDetail._id )   } }>
                Delete
            </button>
        </div>
    )
}

export default TodoDetail