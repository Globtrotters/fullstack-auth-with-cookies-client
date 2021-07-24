import { Switch, Route, withRouter } from "react-router-dom";
import React, { useState, useEffect } from 'react'
import MyNav from './components/MyNav'
import axios from 'axios'
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import AddForm from "./components/AddForm";
import EditForm from './components/EditForm'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import {API_URL} from './config'
import NotFound from "./components/NotFound";
import ChatBot from "./components/ChatBot";
import MyCalendar from './components/MyCalendar'
import MyMap from "./components/MyMap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from './components/CheckoutForm'
//import './App.css'

function App(props) {

  const [todos, updateTodos] = useState([])
  const [user, updateUser] = useState(null)
  const [myError, updateError] = useState(null)
  const [fetchingUser, updateFetchingUser] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        // fetch all the initial todos to show on the home page
          let response = await axios.get(`${API_URL}/api/todos`, {withCredentials: true})
          updateTodos(response.data)

       // fetch the loggedInUser if present
          let userResponse = await axios.get(`${API_URL}/api/user`, {withCredentials: true})
          updateUser(userResponse.data)
      }  
      catch(err){
        updateFetchingUser(false)
      }
    }
    getData()
  }, [])

  useEffect(() => {
    props.history.push('/')
  }, [todos, user])


  const handleAddTodo = async (event) => {

    event.preventDefault()

    //First upload the image to cloudinary
    // then send the image url to our /api/create request
    
    // How to grab the image from our input 
    console.log(event.target.myImage.files[0] )

    let formData = new FormData()
    formData.append('imageUrl', event.target.myImage.files[0])

    let imgResponse = await axios.post(`${API_URL}/api/upload`, formData)

    let newTodo = {
      name: event.target.name.value,
      description: event.target.description.value,
      completed: false,
      image: imgResponse.data.image
    }

    // Pass the data in POST requests as the second parameter
    // create the todo in the DB
    try {
      let todoResponse = await axios.post(`${API_URL}/api/create`, newTodo, {withCredentials: true})
      updateTodos( [todoResponse.data, ...todos])
    }
    catch(err){
      updateError(err.response.data.error)
    }
  
  }

  const handleDeleteTodo = async (todoId) => {
    // delete the todo from the DB
    try {
      await axios.delete(`${API_URL}/api/todos/${todoId}`, {withCredentials: true})
      let filteredTodos = todos.filter((todo) => {
        return todo._id !== todoId
      })
      updateTodos( filteredTodos)
    }
    catch(err){
      updateError(err.response.data.error)
    }
  
  }

  const handleEditTodo = async (event, todo) => {
    event.preventDefault()

    // pass a second parameter to the patch for sending info to your server inside req.body
    await axios.patch(`${API_URL}/api/todos/${todo._id}`, todo, {withCredentials: true})
    try {
      let updatedTodos = todos.map((singleTodo) => {
        if (singleTodo._id === todo._id) {
          singleTodo.name = todo.name
          singleTodo.description = todo.description
        } 
        return singleTodo
      })
      updateTodos(updatedTodos)
    }
    catch(err){
      updateError(err.response.data.error)
    }
  }

  const handleSignUp = async (event) => {
    event.preventDefault()
    // event.target here is a `<form>` node
    const {username, email, password} = event.target

    // our new user info
    let newUser = {
      username: username.value,
      email: email.value,
      password: password.value
    }

    // make a POST signup request to the server
    try {
      await axios.post(`${API_URL}/api/signup`, newUser, {withCredentials: true})
      props.history.push('/')
    }
    catch(err) {
      console.log('Signup failed', err)
    }
  }

  const handleSignIn = async (event) => {
    event.preventDefault()
    console.log('Sign in works!!!! Yippeeee')
     // event.target here is a `<form>` node
     const { email, password} = event.target

     // our new user info
     let myUser = {
       email: email.value,
       password: password.value
     }
 
     // make a POST signin request to the server
     try {
        let response = await axios.post(`${API_URL}/api/signin`, myUser, {withCredentials: true})
        updateUser(response.data) 
     }
     catch(err) {
        updateError(err.response.data.error)
     }
  }


  const handleLogOut = async () => {
    try {
      await axios.post(`${API_URL}/api/logout`, {}, {withCredentials: true})
      updateUser(null)
    }
    catch(err) {
      updateError(err.response.data.error)
    }
  }


  const promise = loadStripe("pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3");

    if (fetchingUser) {
      return <p>Loading . . . </p>
    }

    /*

    return (
      <div>
        <Elements stripe={promise}>
          <CheckoutForm />
        </Elements>
      </div>
    )
    */

    return (
      <div >
          <MyNav user={user} onLogOut={handleLogOut} />
          <MyCalendar />
          <ChatBot />
          <MyMap />
          <Switch>
              <Route exact path={'/'}  render={() => {
                return <TodoList  todos={todos} />
              }} />
              <Route exact path={'/todo/:todoId'} render={(routeProps) => {
                return <TodoDetail user={user} {...routeProps} onDelete={handleDeleteTodo} />
              }} />
              <Route path={'/todo/:todoId/edit'} render={(routeProps) => {
                return <EditForm {...routeProps}  onEdit={handleEditTodo} />
              }} />
              <Route path={'/add-form'} render={() => {
                 return <AddForm user={user} onAdd={handleAddTodo}/>
              }} />
              <Route  path="/signin"  render={(routeProps) => {
                return  <SignIn  error={myError} onSignIn={handleSignIn} {...routeProps}  />
              }}/>
              <Route  path="/signup"  render={(routeProps) => {
                return  <SignUp onSignUp={handleSignUp} {...routeProps}  />
              }}/>
              <Route component={NotFound} />
          </Switch>
      </div>
    );
}


export default withRouter(App);
