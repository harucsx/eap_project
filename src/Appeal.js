import {Button, Header, Icon, Image, Label, Modal, Rating, Segment, Table} from "semantic-ui-react";
import React, {Component} from "react";
import {firestore} from "firebase";

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
  }

  loadAppeals(subjectId) {
    let appeals = [];

    firestore().collection('subjects').doc(subjectId).collection('appeal').get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        appeals.push(doc.data());
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
            {/*<Table.Row>*/}
              {/*<Table.Cell>*/}
                {/*<Header as='h2' textAlign='center'>*/}
                  {/*승인*/}
                {/*</Header>*/}
              {/*</Table.Cell>*/}
              {/*<Table.Cell singleLine>2012310682</Table.Cell>*/}
              {/*<Table.Cell>*/}
                {/*신청합니다.*/}
              {/*</Table.Cell>*/}
              {/*<Table.Cell textAlign='center'>*/}
                {/*2018/10/12*/}
              {/*</Table.Cell>*/}
              {/*<Table.Cell>*/}
                {/*너무 힘이듭니다... 제발 출석 인정 해주세요.*/}
              {/*</Table.Cell>*/}
              {/*<Table.Cell textAlign='center'>*/}
                {/*<Image*/}
                  {/*src={'https://react.semantic-ui.com/images/wireframe/image.png'}*/}
                  {/*size='tiny' onClick={this.show}*/}
                {/*/>*/}
              {/*</Table.Cell>*/}
            {/*</Table.Row>*/}

            {this.state.appeals && this.state.appeals.map((appeal) => {
              const date = new Date(appeal.time);

              return (
                <Table.Row>
                  <Table.Cell>
                    <Header as='h2' textAlign='center'>
                      <a onClick={() => alert('이 기능은 개발중입니다.')}>미처리</a>
                    </Header>
                  </Table.Cell>
                  <Table.Cell singleLine>2012310682</Table.Cell>
                  <Table.Cell>
                    {appeal.title}
                  </Table.Cell>
                  <Table.Cell textAlign='center'>
                    {date.getFullYear()}/{date.getMonth() + 1}/{date.getDate()}
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
