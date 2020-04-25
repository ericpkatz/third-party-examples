import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import React, { useEffect, useState } from 'react';
import { Calendar as Cal } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment  from 'moment';


const Calendar = (props)=> {
  const [calendar, setCalendar] = useState({});
  const [today, setToday] = useState(moment().toDate());
  let el;

  useEffect(()=> {
    console.log('once');
    const _calendar = new Cal(el, {
      plugins: [ dayGridPlugin, interactionPlugin ],
      events : props.events.map( e => {
        return {...d, title: e.name };
      }),
      dateClick: function(ev){
        setToday(ev.date);
        console.log('dateClick', ev)
      },
      eventClick: function(ev){
        console.log('select', ev)
      }
    });

    _calendar.render();
    setCalendar(_calendar);
  }, []);

  useEffect(()=> {
    let ids = [];
    if(calendar.getEvents){
      ids = calendar.getEvents().map( event => event.id); 
    }
    props.events.forEach( ev => {
      if(!ids.includes(ev.id)){
        calendar.addEvent({...ev, title: ev.name, start: ev.startTime, allDay: true });
      }
    });
  }, [props.events, calendar]);
  return (
    <div>
      <div onClick={()=> props.createEvent(today)}>{ moment(today).format('MM/DD/YYYY') }</div>
      <div ref={ ref => el = ref } />
    </div>
  );

};

export default Calendar;
