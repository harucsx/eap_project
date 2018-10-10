import {Button, Icon, Label, Segment} from "semantic-ui-react";
import React, {Component} from "react";
import {firestore} from "firebase";

export default class Passcode extends Component {
  state = {};
  passcodeValid = false;

  componentDidMount() {
    this.setState({subjectId: this.props.subjectId, subject: this.props.subject});
  }

  //
  // componentWillReceiveProps() {
  //   console.log('r', this.props.subject);
  //   this.setState({subject: this.props.subject});
  // }

  // getDerivedStateFromProps(nextProps, prevState) {
  //   console.log('r',nextProps);
  //   return {subject: nextProps.subject};
  // }

  loadSubject() {
    firestore().collection('subjects').doc(this.subjectId).get().then((doc) => {
      this.setState({subjectId: this.subjectId, subject: doc.data()});
    });
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

  render() {
    let passcode = '불러오는 중...';

    if (this.state.subject) {
      if (this.state.subject.passcode.code) {
        passcode = this.state.subject.passcode.code;
        this.passcodeValid = true;
      } else {
        passcode = '아직 발행되지 않음';
      }
    }

    return (
      <Button as='div' labelPosition='right' onClick={this.handleClick.bind(this)}>
        <Button icon>
          <Icon name='address book outline'/>
          출석번호 발급
        </Button>
        <Label as='a' basic pointing='left'>
          {passcode}
        </Label>
      </Button>
    );
  }
};
