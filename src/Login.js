import React, {Component} from 'react';
import {Button, Input} from "semantic-ui-react";
import firebase from "firebase";
import './Login.css';

export default class Login extends Component {
  state = {
    email: '',
    password: '',
  };

  handleChange = (e) => {
    this.setState({
      ...this.state,
      [e.target.name]: e.target.value
    });
  };

  render() {
    return (
      <div className='Login-Container'>
        <Input name='email'
               icon='users'
               iconPosition='left'
               placeholder='아이디'
               value={this.state.name}
               onChange={this.handleChange}
        />
        <br/>
        <br/>
        <Input name='password'
               type='password'
               icon='key'
               iconPosition='left'
               placeholder='비밀번호'
               value={this.state.name}
               onChange={this.handleChange}
        />
        <br/>
        <br/>
        <Button
          className='Login-Button'
          content='로그인'
          icon='arrow circle right'
          labelPosition='right'
          onClick={() => {
            const email = this.state.email.trim() + "@professor.me";
            const password = this.state.password;

            firebase.auth().signInWithEmailAndPassword(email, password)
              .then(function (result) {
                this.props.setLogin(result.user);
                // alert(JSON.stringify(result));
              }.bind(this))
              .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                alert(error);
                // ...
              });

          }}
        />
      </div>);
  }
}