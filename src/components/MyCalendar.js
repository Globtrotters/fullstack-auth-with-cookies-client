import React from  'react'
import FullCalendar from  '@fullcalendar/react'
import dayGridPlugin from  '@fullcalendar/daygrid'
import interactionPlugin from  "@fullcalendar/interaction"; // needed for dayClick

class MyCalendar extends React.Component {
	handleDateClick = (arg) => { // bind with an arrow function
		alert(arg.dateStr)
	}

	render() {
		return (
		     	<div style={{width: '500px', height: '600px'}}>
				<FullCalendar
					plugins={[ dayGridPlugin, interactionPlugin ]}
					dateClick={this.handleDateClick}
				/>
			</div>
		)
	}
}

export default MyCalendar 