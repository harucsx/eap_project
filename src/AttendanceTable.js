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
        this.getAttendanceInfo(this.props.subjectId);
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

      thisWeek[i - 1] = yyyy + '-' + mm + '-' + dd;
    }

    const currentWeekStartDay = thisWeek[0];
    const currentWeekEndDay = thisWeek[4];

    this.setState({
      ...this.state,
      weeks: thisWeek.splice(0, 5),
      currentWeekStartDay: currentWeekStartDay,
      currentWeekEndDay: currentWeekEndDay,
    });
  }

  getAttendanceInfo(subjectId) {
    let attendanceTable = {};

    firestore().collection("subjects").doc(subjectId).collection("attendance")
      .get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        attendanceTable[doc.id] = doc.data();
      });

      this.setState({...this.state, attendanceTable});
    }.bind(this));


    //
    // this.state.subject.students.forEach((uid) => {
    //   firestore().collection("subjects").doc(this.state.subjectId).collection("attendance")
    //   // .where("student", "==", uid)
    //   // .where("created_at", ">", new Date(start))
    //   // .where("created_at", "<", new Date(end))
    //     .get().then(function (querySnapshot) {
    //     console.log('result:', querySnapshot.size);
    //     querySnapshot.forEach(function (doc) {
    //       // doc.data() is never undefined for query doc snapshots
    //       console.log(doc.id, " => ", doc.data());
    //
    //       const {student, day, time, created_at} = doc.data();
    //       const a_date = new Date(created_at);
    //       const att_date = (a_date.getMonth() + 1) + '-' + a_date.getDate();
    //       // console.log('A', att_date);
    //       attendanceTable[student + '.' + att_date] = true;
    //       // console.log(attendanceTable);
    //     });
    //   })
    //     .catch((error) => console.log(error));
    // });
    //
    // this.setState({...this.state, attendanceTable: attendanceTable}, () => {
    //   // alert(JSON.stringify(this.state.attendanceTable));
    //
    // });
    // console.log(attendanceTable);
  }

  updateAttendance(studentId, day, mode) {
    if (!this.state.attendanceTable[day] || !this.state.attendanceTable[day].present_count) {
      alert('해당 날짜에 출석 처리가 이루어지지 않아 변경할 수 없습니다.');
      return false;
    }

    let update_object = {};
    let new_count = 0;

    if (mode == 'present') {
      new_count = this.state.attendanceTable[day].present_count;
    } else if (mode == 'late') {
      new_count = this.state.attendanceTable[day].present_count / 2;
    } else {
      new_count = 0;
    }

    update_object[studentId] = new_count;

    firestore().collection("subjects").doc(this.state.subjectId)
      .collection("attendance").doc(day).update(update_object).then(function () {
        this.state.attendanceTable[day][studentId] = new_count;

        this.setState({...this.state, attendanceTable: this.state.attendanceTable});
      }.bind(this)
    );

    return true;
  }

  render() {
    if (!this.state.subject || !this.state.weeks) {
      return <Loader active inline='centered'/>;
    }

    let currentWeekData = this.state.subject.classes;
    if (this.state.subject.extra_classes && this.state.subject.extra_classes[this.state.currentWeekStartDay]) {
      currentWeekData = this.state.subject.extra_classes[this.state.currentWeekStartDay];
    }

    let activateDays = {};
    for (let i = 1; i <= 5; i++) {
      if (currentWeekData.find((date) => date.day === i)) {
        activateDays[i] = true;
      } else {
        activateDays[i] = false;
      }
    }

    // this.state.attendanceTable

    return (
      <div className='Attendance-Table'>
        {/*{JSON.stringify(activateDays)}*/}
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell textAlign='center' singleLine>학번</Table.HeaderCell>
              {this.state.weeks.map((day, day_index) =>
                <Table.HeaderCell textAlign='center'>{day}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.state.subject.students.map((studentId) =>
              <Table.Row>
                <Table.Cell textAlign='center' collapsing>학생 ({studentId.slice(0, 4)})</Table.Cell>

                {this.state.weeks.map((day, day_index) => {


                    if (!activateDays[day_index + 1]) {
                      return (
                        <Table.Cell textAlign='center'>
                          <Icon name='dot circle' size='large'/>
                        </Table.Cell>)
                    }

                    return (<Table.Cell textAlign='center'>
                      <Form.Field>
                        {function () {
                          // present, late, absent, none

                          let type = 'none';

                          if (this.state.attendanceTable && this.state.attendanceTable[day]) {

                            let present_count = (this.state.attendanceTable[day].present_count) ? this.state.attendanceTable[day].present_count : 0;
                            let student_count = (this.state.attendanceTable[day][studentId]) ? this.state.attendanceTable[day][studentId] : 0;

                            if (present_count === 0) {
                              type = 'none';
                            }
                            else if (present_count === student_count) {
                              type = 'present';
                            } else if (student_count >= present_count / 2) {
                              type = 'late';
                            } else {
                              type = 'absent';
                            }
                          }

                          return (
                            <Button.Group icon>
                              <Button color={(type === 'present') ? 'green' : ''}
                                      onClick={function () {
                                        this.updateAttendance.bind(this)(studentId, day, 'present');
                                      }.bind(this)}
                              >
                                <Icon name='check'/>
                              </Button>
                              <Button color={(type === 'late') ? 'orange' : ''}
                                      onClick={function () {
                                        this.updateAttendance.bind(this)(studentId, day, 'late');
                                      }.bind(this)}
                              >
                                <Icon name='exclamation triangle'/>
                              </Button>
                              <Button color={(type === 'absent') ? 'red' : ''}
                                      onClick={function () {
                                        this.updateAttendance.bind(this)(studentId, day, 'absent');
                                      }.bind(this)}
                              >
                                <Icon name='close'/>
                              </Button>
                            </Button.Group>
                          )
                        }.bind(this)()}


                      </Form.Field>
                    </Table.Cell>)
                  }
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