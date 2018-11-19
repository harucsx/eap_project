import React, {Component} from 'react'
import {Button, Loader, Table} from 'semantic-ui-react'
import {firestore} from "firebase";
import './TimeTable.css'

export default class ModifiedTimeTable extends Component {
  state = {currentDay: new Date()};

  componentDidMount() {
    // this.getThisWeek();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let currentDay = prevState.currentDay;
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

    let extra_classes = nextProps.subject.classes;
    const currentWeekStartDay = currentDay.getFullYear() + '-' + thisWeek[0];
    const currentWeekEndDay = currentDay.getFullYear() + '-' + thisWeek[4];

    if (!nextProps.subject.extra_classes) {
      nextProps.subject.extra_classes = {};
    }

    if (!nextProps.subject.extra_classes[currentWeekStartDay]) {
      nextProps.subject.extra_classes[currentWeekStartDay] = [...nextProps.subject.classes];
    }

    return Object.assign(prevState, {
      subjectId: nextProps.subjectId,
      subject: nextProps.subject,
      currentWeekStartDay: currentWeekStartDay,
      currentWeekEndDay: currentWeekEndDay,
    })
  }

  isHighlight(no, day) {
    return this.state.subject.extra_classes[this.state.currentWeekStartDay].filter(e => e.day == day && e.time == no).length > 0;
  }

  removeClass(no, day) {
    return this.state.subject.extra_classes[this.state.currentWeekStartDay].filter(e => !(e.day == day && e.time == no));
  }
  //
  // getThisWeek() {
  //   let currentDay = this.state.currentDay;
  //   let theYear = currentDay.getFullYear();
  //   let theMonth = currentDay.getMonth();
  //   let theDate = currentDay.getDate();
  //   let theDayOfWeek = currentDay.getDay();
  //
  //   let thisWeek = [];
  //
  //   for (let i = 1; i < 7; i++) {
  //     let resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
  //     let yyyy = resultDay.getFullYear();
  //     let mm = Number(resultDay.getMonth()) + 1;
  //     let dd = resultDay.getDate();
  //
  //     mm = String(mm).length === 1 ? '0' + mm : mm;
  //     dd = String(dd).length === 1 ? '0' + dd : dd;
  //
  //     thisWeek[i - 1] = mm + '-' + dd;
  //   }
  //
  //   let extra_classes = this.state.subject.classes;
  //   const currentWeekStartDay = currentDay.getFullYear() + '-' + thisWeek[0];
  //   const currentWeekEndDay = currentDay.getFullYear() + '-' + thisWeek[4];
  //
  //   if (this.state.subject.extra_classes && this.state.subject.extra_classes[currentWeekStartDay]) {
  //     extra_classes = this.state.subject.extra_classes[currentWeekStartDay];
  //   }
  //   console.log(currentWeekStartDay, currentWeekEndDay);
  //
  //   this.state.currentWeekStartDay = currentWeekStartDay;
  //   this.state.currentWeekEndDay = currentWeekEndDay;
  //
  //   this.setState({
  //     ...this.state,
  //     currentWeekStartDay: currentWeekStartDay,
  //     currentWeekEndDay: currentWeekEndDay + 'a',
  //     extra_classes: extra_classes,
  //   });
  // }

  render() {
    if (!this.state.subject) {
      return <Loader active inline='centered'/>;
    }

    return (
      <div className='ModifiedTimeTable-Table'>
        {/*<b>{JSON.stringify(this.state.subject.extra_classes[this.state.currentWeekStartDay])}</b><br/><br/>*/}
        {/*<b>{JSON.stringify(this.state)}</b><br/><br/>*/}
        기간 : <b>{this.state.currentWeekStartDay} ~ {this.state.currentWeekEndDay}</b>
        <Table celled className="Table">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell textAlign='center' singleLine>교시</Table.HeaderCell>
              {['월', '화', '수', '목', '금'].map((day) =>
                <Table.HeaderCell textAlign='center'>{day}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {/*교시*/}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((no) =>
              <Table.Row>
                <Table.Cell textAlign='center' collapsing>{no}</Table.Cell>
                {/*요일*/}
                {[1, 2, 3, 4, 5].map((day) =>
                  <Table.Cell textAlign='center'
                    selectable
                    warning={this.isHighlight(no, day)}
                    onClick={() => {
                      if (this.isHighlight(no, day)) {
                        this.state.subject.extra_classes[this.state.currentWeekStartDay] = this.removeClass(no, day);
                      } else {
                        this.state.subject.extra_classes[this.state.currentWeekStartDay].push({day: day, time: no});
                      }
                      this.setState({...this.state});

                      firestore().collection('subjects')
                        .doc(this.props.subjectId)
                        .set(this.state.subject).then(() => {
                      });
                    }}>
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
                // this.getThisWeek.bind(this)();
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
                // this.getThisWeek.bind(this)();
              });
          }}
        />
        <div> <font color='white'>.</font></div>
        <div> <font color='white'>.</font></div>
      </div>
    );
  }
}
