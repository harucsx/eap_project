import React, {Component} from 'react'
import {Loader, Table} from 'semantic-ui-react'
import {firestore} from "firebase";
import './TimeTable.css'

export default class TimeTable extends Component {
  state = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    return Object.assign(prevState, {subjectId: nextProps.subjectId, subject: nextProps.subject})
  }

  isHighlight(no, day) {
    return this.state.subject.classes.filter(e => e.day == day && e.time == no).length > 0;
  }

  removeClass(no, day) {
    return this.state.subject.classes.filter(e => !(e.day == day && e.time == no));
  }

  render() {
    if (!this.state.subject) {
      return <Loader active inline='centered'/>;
    }

    return (
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
                                this.state.subject.classes = this.removeClass(no, day);
                              } else {
                                this.state.subject.classes.push({day: day, time: no});
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
    );
  }
}
