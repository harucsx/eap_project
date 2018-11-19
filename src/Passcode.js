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

  pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return Object.assign(prevState, {subjectId: nextProps.subjectId, subject: nextProps.subject})
  }

  getThisWeek() {
    let currentDay = new Date();
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

  handleClick() {
    this.getThisWeek();

    let currentWeekData = this.state.subject.classes;
    if (this.state.subject.extra_classes && this.state.subject.extra_classes[this.state.currentWeekStartDay]) {
      currentWeekData = this.state.subject.extra_classes[this.state.currentWeekStartDay];
    }

    if (!(currentWeekData.find((date) => date.day === new Date().getDay() && date.time === Math.floor(((new Date).getHours() - 8) / 1)))) {
      alert('출석 번호는 수업 시간에만 발급할 수 있습니다.');
      return;
    }

    const randomCode = Math.floor(Math.random() * 900000 + 100000);
    const subject = Object.assign(this.state.subject,
      {passcode: {code: randomCode, created_at: new Date()}});

    firestore().collection('subjects').doc(this.props.subjectId).set(subject).then(() => {
      this.props.refresh();
    });


    const today = new Date();
    const docId = today.getFullYear() + '-' + this.pad(today.getMonth() + 1, 2) + '-' + this.pad(today.getDate(), 2);

    let docRef = firestore().collection("subjects").doc(this.state.subjectId)
      .collection("attendance").doc(docId);

    docRef.get().then((doc) => {
      let present_count = doc.data().present_count;

      if (!present_count) {
        present_count = 0;
      }

      docRef.set({
        present_count: present_count + 1
      }, {merge: true}).then();

    }).catch((error) => {

      docRef.set({
        present_count: 1
      }, {merge: true}).then();
    });
  }

  render() {
    let passcode = '불러오는 중...';

    if (this.state.subject) {
      if (this.state.subject.passcode.code) {

        const c_date = new Date(this.state.subject.passcode.created_at);
        const now = new Date();

        if ((now - c_date) < 3 * 60 * 1000) {
          passcode = this.state.subject.passcode.code;
          this.passcodeValid = true;
        } else {
          passcode = '만료됨';
        }

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
