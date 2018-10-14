import React, {Component} from 'react'
import './AttendanceTable.css'
import {Radio, Form, Table, Button, Loader, Icon} from 'semantic-ui-react'
import {firestore} from "firebase";

export default class AttendanceTable extends Component {
  state = {currentDay: new Date()};

  static getDerivedStateFromProps(nextProps, prevState) {
    return Object.assign(prevState, {subjectId: nextProps.subjectId, subject: nextProps.subject})
  }

  componentDidMount() {
    this.setState({...this.state, currentDay: new Date()},
      () => {
        this.getThisWeek();
      });
  }

  getThisWeek() {
    let currentDay = this.state.currentDay;
    let theYear = currentDay.getFullYear();
    let theMonth = currentDay.getMonth();
    let theDate = currentDay.getDate();
    let theDayOfWeek = currentDay.getDay();

    let thisWeek = [];

    for (let i = 1; i < 7; i++) {
      let resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
      let yyyy = resultDay.getFullYear();
      let mm = Number(resultDay.getMonth()) + 1;
      let dd = resultDay.getDate();

      mm = String(mm).length === 1 ? '0' + mm : mm;
      dd = String(dd).length === 1 ? '0' + dd : dd;

      thisWeek[i - 1] = mm + '-' + dd;
    }

    this.getAttendanceInfo(
      currentDay.getFullYear() + ' ' + thisWeek[0],
      currentDay.getFullYear() + ' ' + thisWeek[5]);
    this.setState({...this.state, weeks: thisWeek.splice(0, 5)});
  }

  getAttendanceInfo(start, end) {
    if (!this.state.subject) return;


    let attendanceTable;

    if (this.state.attendanceTable) {
      attendanceTable = Object.assign({}, this.state.attendanceTable);
    } else {
      attendanceTable = {}
    }

    this.state.subject.students.forEach((uid) => {
      firestore().collection("subjects").doc(this.state.subjectId).collection("attendance")
      // .where("student", "==", uid)
      // .where("created_at", ">", new Date(start))
      // .where("created_at", "<", new Date(end))
        .get().then(function (querySnapshot) {
        console.log('result:', querySnapshot.size);
        querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());

          const {student, day, time, created_at} = doc.data();
          const a_date = new Date(created_at);
          const att_date = (a_date.getMonth() + 1) + '-' + a_date.getDate();
          // console.log('A', att_date);
          attendanceTable[student + '.' + att_date] = true;
          // console.log(attendanceTable);
        });
      })
        .catch((error) => console.log(error));
    });

    this.setState({...this.state, attendanceTable: attendanceTable}, () => {
      // alert(JSON.stringify(this.state.attendanceTable));

    });
    console.log(attendanceTable);
  }

  render() {
    if (!this.state.subject || !this.state.weeks) {
      return <Loader active inline='centered'/>;
    }

    return (
      <div className='Attendance-Table'>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>유저</Table.HeaderCell>
              {this.state.weeks.map((day) =>
                <Table.HeaderCell>{day}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.state.subject.students.map((studentId) =>
              <Table.Row>
                <Table.Cell>학생 ({studentId.slice(0, 4)})</Table.Cell>

                {this.state.weeks.map((day, day_index) =>
                  <Table.Cell>
                    <Form.Field>
                      {/*<Radio name={studentId + day} value='p'/>*/}
                      {/*<Radio name={studentId + day} value='a'/>*/}
                      <Button.Group icon>
                        <Button color={
                          this.state.attendanceTable &&
                          this.state.attendanceTable[studentId + '.' + (day)] ?
                            'blue' : ''
                        }
                                onClick={() => {
                                  // alert(studentId + '.' + (day));
                                  // alert(JSON.stringify(this.state.attendanceTable));
                                  // alert(this.state.attendanceTable[studentId + '.' + (day)]);

                                  firestore().collection("subjects").doc(this.state.subjectId).collection("attendance")
                                    .add({
                                      created_at: new Date(this.state.currentDay.getFullYear() + ' ' + day),
                                      day: day,
                                      time: 0,
                                      student: studentId,
                                    }).then(function () {
                                      this.state.attendanceTable[studentId + '.' + (day)] = true;
                                      this.setState({...this.state, attendanceTable: this.state.attendanceTable});
                                    }.bind(this)
                                  );
                                }}>
                          <Icon name='check'/>
                        </Button>
                        <Button color={
                          this.state.attendanceTable &&
                          this.state.attendanceTable[studentId + '.' + (day)] ?
                            '' : 'red'
                        }
                                onClick={() => {
                                  // alert(studentId + '.' + (day));
                                  // alert(JSON.stringify(this.state.attendanceTable));
                                  // alert(this.state.attendanceTable[studentId + '.' + (day)]);

                                  this.state.attendanceTable[studentId + '.' + (day)] = false;
                                  this.setState({...this.state, attendanceTable: this.state.attendanceTable});

                                  // firestore().collection("subjects").doc(this.state.subjectId).collection("attendance")
                                  //   .where()
                                  //   .add({
                                  //     created_at: new Date(this.state.currentDay.getFullYear() + ' ' + day),
                                  //     day: day,
                                  //     time: 0,
                                  //     student: studentId,
                                  //   }).then(function () {
                                  //     this.state.attendanceTable[studentId + '.' + (day)] = true;
                                  //     this.setState({...this.state, attendanceTable: this.state.attendanceTable});
                                  //   }.bind(this)
                                  // );
                                }}
                        >
                          <Icon name='close'/>
                        </Button>
                      </Button.Group>
                    </Form.Field>
                  </Table.Cell>
                )}

              </Table.Row>
            )}
          </Table.Body>
        </Table>

        <Button
          className='Left'
          content='이전 주'
          icon='left arrow'
          labelPosition='left'
          onClick={() => {
            this.state.currentDay.setDate(this.state.currentDay.getDate() - 7);
            this.setState({...this.state,},
              () => {
                this.getThisWeek.bind(this)();
              });
          }}
        />
        <Button
          className='Right'
          content='다음 주'
          icon='right arrow'
          labelPosition='right'
          onClick={() => {
            this.state.currentDay.setDate(this.state.currentDay.getDate() + 7);
            this.setState({...this.state,},
              () => {
                this.getThisWeek.bind(this)();
              });
          }}
        />
      </div>
    );
  }
}