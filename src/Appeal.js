import {Button, Header, Icon, Image, Label, Modal, Rating, Segment, Table} from "semantic-ui-react";
import React, {Component} from "react";
import {firestore} from "firebase";
import _ from "lodash";

export default class Appeal extends Component {
  show = () => this.setState({open: true});
  close = () => this.setState({open: false});

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    this.loadAppeals(this.props.subjectId);
    this.setState({...this.state, subjectId: this.props.subjectId});
  }

  loadAppeals(subjectId) {
    let appeals = [];

    firestore().collection('subjects').doc(subjectId).collection('appeal').get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        appeals.push(Object.assign({id: doc.id,}, doc.data()));
      });

      appeals = _.sortBy(appeals, (appeal) => {
        let date = new Date(appeal.time);

        if (appeal.result === true) {
          date.setFullYear(date.getFullYear() - 10);
        } else if (appeal.result === false) {
          date.setFullYear(date.getFullYear() - 10);
        }

        return -date.getTime();
      });

      this.setState({...this.state, appeals});
    }.bind(this));
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return Object.assign(prevState, {subjectId: nextProps.subjectId, subject: nextProps.subject})
  }

  handleClick() {
    const randomCode = Math.floor(Math.random() * 900000 + 100000);
    const subject = Object.assign(this.state.subject,
      {passcode: {code: randomCode, created_at: new Date()}});

    firestore().collection('subjects').doc(this.props.subjectId).set(subject).then(() => {
      this.props.refresh();
    });
  }

  pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  handleAppeal(appealId, day, studentId, confirm) {
    let update_object = {};

    if (confirm) {
      update_object[studentId + '_force_mode'] = 'present';

      firestore().collection("subjects").doc(this.state.subjectId)
        .collection("attendance").doc(day).set(update_object, {merge: true}).then(function () {

        }.bind(this)
      );
    }

    firestore().collection('subjects').doc(this.state.subjectId).collection('appeal').doc(appealId).set({result: confirm}, {merge: true}).then(function () {
      alert('처리가 완료되었습니다.');
    });
  }

  render() {
    return (
      <div>
        <Table celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell textAlign='center' singleLine>처리 결과</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>학번</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>제목</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>날짜</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>사유</Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>증빙 사진</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.state.appeals && this.state.appeals.map((appeal) => {
              const date = new Date(appeal.time);
              const day = date.getFullYear() + '-' + this.pad(date.getMonth() + 1, 2) + '-' + this.pad(date.getDate(), 2);

              return (
                <Table.Row>
                  <Table.Cell textAlign='center'>
                    {(appeal.result === undefined) &&
                    <div>
                      <Icon circular inverted color='teal' name='check'
                            onClick={() => this.handleAppeal.bind(this)(appeal.id, day, appeal.uid, true)}/>
                      <Icon circular name='x'
                            onClick={() => this.handleAppeal.bind(this)(appeal.id, day, appeal.uid, false)}/>
                    </div>
                    }
                    {(appeal.result !== undefined) &&
                    <Header as='h2' textAlign='center'>
                      {(appeal.result) ? '승인됨' : '거부됨'}
                    </Header>
                    }
                  </Table.Cell>
                  <Table.Cell singleLine>{this.state.subject.student_infos[appeal.uid]}</Table.Cell>
                  <Table.Cell>
                    {appeal.title}
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    {date.getFullYear()}/{this.pad(date.getMonth() + 1, 2)}/{this.pad(date.getDate(), 2)}
                  </Table.Cell>
                  <Table.Cell>
                    {appeal.content}
                    {/*{JSON.stringify(appeal)}*/}
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    <Image
                      src={'https://firebasestorage.googleapis.com/v0/b/eap-project-cd091.appspot.com/o/' + appeal.filePath + '?alt=media'}
                      size='tiny'
                      onClick={function () {
                        this.setState({...this.state, image: appeal.filePath});
                        this.show();
                      }.bind(this)
                      }
                    />
                  </Table.Cell>
                </Table.Row>);
            })}
          </Table.Body>
        </Table>

        <Modal size={'small'} dimmer={'blurring'} open={this.state.open} onClose={this.close}>
          <Modal.Header>증명 사진</Modal.Header>
          <Modal.Content image>
            <Image wrapped size='100%'
                   src={'https://firebasestorage.googleapis.com/v0/b/eap-project-cd091.appspot.com/o/' + this.state.image + '?alt=media'}/>
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.close}>
              닫기
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
};
