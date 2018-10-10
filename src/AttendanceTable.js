import React, {Component} from 'react'
import './AttendanceTable.css'
import {Radio, Form, Table, Button, Loader} from 'semantic-ui-react'

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

    for (let i = 1; i < 6; i++) {
      let resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
      let yyyy = resultDay.getFullYear();
      let mm = Number(resultDay.getMonth()) + 1;
      let dd = resultDay.getDate();

      mm = String(mm).length === 1 ? '0' + mm : mm;
      dd = String(dd).length === 1 ? '0' + dd : dd;

      thisWeek[i] = mm + '-' + dd;
    }

    this.setState({...this.state, weeks: thisWeek});
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

                {this.state.weeks.map((day) =>
                  <Table.Cell>
                    <Form.Field>
                      <Radio name={studentId + day} value='p'/>
                      <Radio name={studentId + day} value='a'/>
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