import React, { Component } from  'react'
import {Button} from  'react-bootstrap'
import {Redirect} from 'react-router-dom'

class AddForm extends Component {

    // my props will look like this
    /*
        this.props = {
            onAdd : func,
			user: OBject
        }

    */
    
	render() {

		if (!this.props.user) {
			//redirect to signin page 
			return <Redirect to={'/signin'} />
		}

		return (
			<form onSubmit={this.props.onAdd}  >
				<input  name="name"  type="text"  placeholder="Enter name"/>
				<input  name="description"  type="text"  placeholder="Enter desc"/>
				<Button  type="submit"  >Submit</Button>
			</form>
		)
	}
}

export  default AddForm