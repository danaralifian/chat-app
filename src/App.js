import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Grid } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Cookies from 'js-cookie'
import axios from './axios'
import md5 from 'md5'
import Pusher from 'pusher-js'
import Config from './config/app.config'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [message, setMessage] = useState('')
  const [userLogin, setUser] = useState('')
  const [messages, setMessages] = useState([])

  //subscribe to channel pusher
  useEffect(()=>{
    const pusher = new Pusher("7984c3686be18d5a41e8",{ //app key
      cluster : "ap1",
    })

    const channel = pusher.subscribe("messages") //channel must same with backend
    channel.bind("inserted", newMessage=>{
      setMessages([...messages, newMessage])
      alert('you have new message')
    }) 

    return ()=>{
      channel.unbind_all()
      channel.unsubscribe()
    }
  },[messages])

  useEffect(()=>{
    if(receiverId){
      Cookies.set('receiverId', receiverId)
    }
    getMessages()
  },[])

  const getMessages=()=>{
    axios({
      method : 'GET',
      url : Config.host + "/chats",
      headers : {
        Authorization : 'Bearer '+Cookies.get('accessToken')
      },
    })
    .then(res=>{
      setMessages(res.data.records)
      console.log(res)
    })
    .catch(err=>{
      console.log(err)
    })
  }

  const signIn=()=>{
    axios({
      method : 'POST',
      url : Config.host +'/auth',
      data : {
        email : email,
        password : md5(password)
      }
    })
    .then(res=>{
      Cookies.set('accessToken', res.data.accessToken, { expires: 7 })
      Cookies.set('email', res.data.email, { expires: 7 })
      Cookies.set('refreshToken', res.data.refreshToken, { expires: 7 })
      setUser(JSON.stringify(res.data))
    })
    .catch(()=>{
      alert('error')
    })
  }

  const sendMessage=()=>{
    axios({
      method : 'POST',
      url : Config.host +'/chat',
      headers : {
        Authorization : 'Bearer '+Cookies.get('accessToken')
      },
      data : {
        message : message,
        receiverId : Cookies.get('receiverId'),
      }
    }) 
    .then(res=>{
      console.log(res)
    })
    .catch(err=>{
      console.log(err.response)
      alert(JSON.stringify(err.response))
    })
  }

  return (
    <div className="App" style={{margin : '20px'}}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
            <TextField 
              variant='outlined'
              label='receiver id'
              fullWidth
              onChange={(e)=>setReceiverId(e.target.value)}/>
              {Cookies.get('receiverId')}
            <br/><br/>
            <hr/>
            <br/>
            <TextField 
              variant='outlined'
              label='email'
              fullWidth
              onChange={(e)=>setEmail(e.target.value)}/>
            <br/><br/>
            <TextField 
              variant='outlined'
              label='password'
              fullWidth
              onChange={(e)=>setPassword(e.target.value)}/>
            <br/><br/>
            <Button variant="contained" color='primary' fullWidth onClick={signIn}>Login</Button>
            <br/><br/><hr/><br/>
            <TextField 
              variant='outlined'
              label='message'
              multiline
              rows={4}
              fullWidth
              onChange={(e)=>setMessage(e.target.value)}/>
              <br/><br/>
            <Button variant="contained" color='primary' fullWidth onClick={sendMessage}>Send</Button>
            <br/><br/><hr/><br/>
            <div  style={{width : '100%'}}>
            {Cookies.get('email')}
            </div>
        </Grid>
        <Grid item xs={12} md={8}>
          {messages.map((obj,key)=>
            <div style={{border : '1px solid #dddd', padding : 10, margin : 10}}>
              <p><strong>sender : {obj.senderId}</strong></p>
              <p>message : {obj.message}</p>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
