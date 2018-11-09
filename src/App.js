import React, {Component} from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import {Button, Grid, Icon, Image, Label, List, Rating, Segment, Tab} from "semantic-ui-react";
import TimeTable from "./TimeTable";
import AttendanceTable from "./AttendanceTable";
import firebase, {firestore} from "firebase";
import Passcode from "./Passcode";
import Login from "./Login";
import ModifiedTimeTable from "./ModifiedTimeTable";
import Appeal from "./Appeal";


class App extends Component {
  state = {};

  panes = [
    {
      menuItem: '기본 시간표', render: () =>
        <Tab.Pane>
          <TimeTable
            subjectId={this.state.subjectId}
            subject={this.state.subject}
            refresh={this.refresh.bind(this)}
          />
        </Tab.Pane>
    },
    {
      menuItem: '시간표 수정', render: () =>
        <Tab.Pane>
          <ModifiedTimeTable
            subjectId={this.state.subjectId}
            subject={this.state.subject}
            refresh={this.refresh.bind(this)}
          />
        </Tab.Pane>
    },
    {
      menuItem: '출석 확인', render: () =>
        <Tab.Pane>
          <AttendanceTable
            subjectId={this.state.subjectId}
            subject={this.state.subject}
            refresh={this.refresh.bind(this)}
          />
        </Tab.Pane>
    },
    {
      menuItem: '불출석 인증 처리', render: () =>
        <Tab.Pane>
          <Appeal
            subjectId={this.state.subjectId}
            subject={this.state.subject}
            refresh={this.refresh.bind(this)}
          />
        </Tab.Pane>
    },
    {
      menuItem: '인증 관리', render: () =>
        <Tab.Pane>
          <div>
            Wifi BSSID : <input value={this.state.subject.bssid} onChange={(event) => {
            const text = event.target.value;
            this.state.subject.bssid = text.toLowerCase();
            this.setState({...this.state});
          }}
          />
            <Button
              content='저장'
              onClick={() => {
                firestore().collection("subjects").doc(this.state.subjectId).update({bssid: this.state.subject.bssid}).then(function () {
                  alert('저장되었습니다.');
                });
              }}
            />

          </div>
          <div>
            GPS 정보 : 위도 <input value={this.state.subject.latitude} onChange={(event) => {
            const text = event.target.value;
            this.state.subject.latitude = text;
            this.setState({...this.state});
          }}/> 경도 <input value={this.state.subject.longitude} onChange={(event) => {
            const text = event.target.value;
            this.state.subject.longitude = text;
            this.setState({...this.state});
          }}/>
            <Button
              content='저장'
              onClick={() => {
                firestore().collection("subjects").doc(this.state.subjectId).update({
                  latitude: this.state.subject.latitude,
                  longitude: this.state.subject.longitude
                }).then(function () {
                  alert('저장되었습니다.');
                });
              }}
            />
          </div>
        </Tab.Pane>
    },
  ];

  subjectId = '';
  subject = {};
  subjects = [];

  constructor() {
    super();

    firebase.initializeApp({
      apiKey: "AIzaSyClwuRJ61VuvrX11uTYExG2uEbGHROwRA0",
      authDomain: "eap-project-cd091.firebaseapp.com",
      databaseURL: "https://eap-project-cd091.firebaseio.com",
      projectId: "eap-project-cd091",
      storageBucket: "eap-project-cd091.appspot.com",
      messagingSenderId: "656525774664"
    });

  }

  refresh() {
    if (!this.state.subjectId) return;

    firestore().collection('subjects').doc(this.state.subjectId).get().then((doc) => {
      this.setState({...this.state, subject: doc.data()});
    });
  }

  componentDidMount() {
    document.title = "전자 출결 시스템";

    firestore().collection('subjects').get().then((qs) => {
      qs.forEach((doc) => {
        const data = doc.data();
        this.subjects.push({id: doc.id, name: data.name});

        if (!this.state.subjectId) {
          this.setState({...this.state, subjectId: doc.id});
        }
      });

      this.setState({...this.state, subjects: this.subjects}, this.refresh.bind(this));
    });
  }

  switchSubject(subjectId) {
    this.setState({...this.state, subjectId: subjectId}, () => {
      this.refresh();
    });
  }

  setLogin(user) {
    this.setState({...this.state, user: user});
  }

  render() {
    if (!this.state.user) {
      return (
        <Login
          setLogin={this.setLogin.bind(this)}

        />
      )
    }
    return (
      <div className="App">
        <center></center>
        <center></center>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={3}>
              <Segment>
                <List animated verticalAlign='middle'>
                  {this.state.subjects && this.state.subjects.map((subject) => {
                    return (
                      <List.Item
                        className='Class-Item'
                        onClick={function () {
                          this.switchSubject(subject.id);
                        }.bind(this)}>
                        <Icon name='book'/>
                        <List.Content>{subject.name}</List.Content>
                      </List.Item>
                    );
                  })}
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={13}>
              <Segment className="Content">
                <Passcode
                  subjectId={this.state.subjectId}
                  subject={this.state.subject}
                  refresh={this.refresh.bind(this)}/>
                {/*<b>{JSON.stringify(this.state.subject)}</b>*/}
                <Tab className="Subject-Tab" panes={this.panes}/>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
