import { Switch, Route, withRouter } from "react-router-dom";
import React, { Component } from 'react'
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
// import MyMap from "./components/MyMap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from './components/CheckoutForm'
//import './App.css'

class App extends Component {

  state = {
    todos: [],
    user: null,
    myError: null, 
    fetchingUser: true, 
  }

  // Make your /api/todos requst here
  async componentDidMount(){
    try {
      // fetch all the initial todos to show on the home page
        let response = await axios.get(`${API_URL}/api/todos`, {withCredentials: true})
        console.log(response.data)
        this.setState({
          todos: response.data
        })


     // fetch the loggedInUser if present
        let userResponse = await axios.get(`${API_URL}/api/user`, {withCredentials: true})
        this.setState({
          user: userResponse.data,
          fetchingUser: false,
        })

    }  
    catch(err){
      console.log('Todo fetch failed', err)
      this.setState({
        fetchingUser: false,
      })
    }
  }

  handleAddTodo = async (event) => {

    event.preventDefault()

    //First upload the image to cloudinary
    // then send the image url to our /api/create request
    
    // How to grab the image from our input 
    console.log(event.target.myImage.files[0] )

    let formData = new FormData()
    formData.append('imageUrl', event.target.myImage.files[0])

    let imgResponse = await axios.post(`${API_URL}/api/upload`, formData)
    console.log(imgResponse)


    let newTodo = {
      name: event.target.name.value,
      description: event.target.description.value,
      completed: false,
      image: imgResponse.data.image
    }

    // Pass the data in POST requests as the second parameter
    // create the todo in the DB
    axios.post(`${API_URL}/api/create`, newTodo, {withCredentials: true})
      .then((response) => {
          // Also update the state locally
          // use the newly created to from your DB and not the local todo that we created above.

          this.setState({
            todos: [response.data, ...this.state.todos]
          }, () => {
              // to do something synchronous with the setState

              // redirects the app to a certain url
              // we're using the history push method to redirect it to any url we want
              this.props.history.push('/')
          })
      })
      .catch(() => {
        console.log('Adding todo failed')
      })

  }

  handleDeleteTodo = (todoId) => {
    // delete the todo from the DB
    axios.delete(`${API_URL}/api/todos/${todoId}`, {withCredentials: true})
      .then(() => {
        // and then also filter and remove the todo from the local state
        let filteredTodos = this.state.todos.filter((todo) => {
          return todo._id !== todoId
        })

        //update the state and redirect synchronously
        this.setState({
          todos: filteredTodos
        } , () => {
          this.props.history.push('/')
        })

      })
      .catch(() => {
        console.log('Delete failed')
      })
  }

  handleEditTodo = (event, todo) => {
    event.preventDefault()

    // pass a second parameter to the patch for sending info to your server inside req.body
    axios.patch(`${API_URL}/api/todos/${todo._id}`, todo, {withCredentials: true})
      .then(() => {
          // also update your local state here and redirect to home page
          // mapping over all the todos and updating the one that was edited
          let updatedTodos = this.state.todos.map((singleTodo) => {
              if (singleTodo._id === todo._id) {
                singleTodo.name = todo.name
                singleTodo.description = todo.description
              } 
            return singleTodo
          })

          this.setState({
            todos: updatedTodos
          }, () => {
             this.props.history.push('/')
          })
      })
      .catch(() => {
          console.log('Edit failed')
      })
  }

  handleSignUp = async (event) => {
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
      this.props.history.push('/')
    }
    catch(err) {
      console.log('Signup failed', err)
    }
  }

  handleSignIn = async (event) => {
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
       this.setState({
         user: response.data
       }, () => {

          this.props.history.push('/')
       })
       
     }
     catch(err) {
       console.log('Signup failed', err.response.data)
       // axios vides us the server response in `response.data`
       // we put `.error` because our server gives us an object with an `error` key  
       this.setState({
          myError:  err.response.data.error
       })
     }
  }


  handleLogOut = async () => {
    try {

      await axios.post(`${API_URL}/api/logout`, {}, {withCredentials: true})
      // clearing the user once they logout
      this.setState({
        user: null
      } , () => {
        this.props.history.push('/')
      })

    }
    catch(err) {
      console.log('Logout failed', err)
    }
  }

  render() {
    console.log('App props', this.props)
    const promise = loadStripe("pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3");

    if (this.state.fetchingUser) {
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
          <MyNav user={this.state.user} onLogOut={this.handleLogOut} />
          <MyCalendar />
          <ChatBot />
          {/* <MyMap /> */}
          <Switch>
              <Route exact path={'/'}  render={() => {
                return <TodoList  todos={this.state.todos} />
              }} />
              <Route exact path={'/todo/:todoId'} render={(routeProps) => {
                return <TodoDetail user={this.state.user} {...routeProps} onDelete={this.handleDeleteTodo} />
              }} />
              <Route path={'/todo/:todoId/edit'} render={(routeProps) => {
                return <EditForm {...routeProps}  onEdit={this.handleEditTodo} />
              }} />
              <Route path={'/add-form'} render={() => {
                 return <AddForm user={this.state.user} onAdd={this.handleAddTodo}/>
              }} />
              <Route  path="/signin"  render={(routeProps) => {
                return  <SignIn  error={this.state.myError} onSignIn={this.handleSignIn} {...routeProps}  />
              }}/>
              <Route  path="/signup"  render={(routeProps) => {
                return  <SignUp onSignUp={this.handleSignUp} {...routeProps}  />
              }}/>
              <Route component={NotFound} />
          </Switch>
      </div>
    );
  }
}

export default withRouter(App);
