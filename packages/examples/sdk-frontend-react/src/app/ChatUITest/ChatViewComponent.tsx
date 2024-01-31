import styled from 'styled-components';

import { ChatView, CreateGroupModal, MODAL_BACKGROUND_TYPE, MODAL_POSITION_TYPE } from "@pushprotocol/uiweb";
import { Section } from '../components/StyledComponents';

const ChatViewComponentTest = () => {
  const chatFilterList = [
    'bafyreidesy6f4iu34eqccmqh55g35wu36lvlz42c63ivtmgjjhezlzdqta',
    'bafyreig3gs4tpwxumiz5fxypyt4omlxhvrvuj66kfoyioeshawlau6lgem',
  ];

  return (
    <div>
      <h2>Chat View Test page</h2>
      {/* <CreateGroupModal onClose={()=>{console.log('in close')}} /> */}
      <ChatViewComponentCard>
      {/* <CreateGroupModal onClose={()=>{console.log('in close')}}  modalBackground={MODAL_BACKGROUND_TYPE.OVERLAY} modalPositionType={MODAL_POSITION_TYPE.RELATIVE}/> */}

        <ChatView 
          onVerificationFail={() => console.log("Verification Failed")} 
          chatId='0x99A08ac6254dcf7ccc37CeC662aeba8eFA666666' 
          chatProfileHelperComponent={<div style={{display: "flex"}}><a href="https://github.com" target="_blank" rel="noreferrer">Custom Comp</a></div>}
          limit={10}
          isConnected={true} 
          groupInfoModalBackground={MODAL_BACKGROUND_TYPE.OVERLAY}
          groupInfoModalPositionType={MODAL_POSITION_TYPE.RELATIVE}
          verificationFailModalPosition={MODAL_POSITION_TYPE.RELATIVE}
          welcomeComponent={<div style={{display: "flex",flexDirection:'column',border:'1px solid black'}}>
            {/* <p>Welcome</p>
            <p>new chat</p>
            <p>Welcome</p>
            <p>new chat</p>
            <p>Welcome</p>
            <p>new chat</p>
            <p>Welcome</p> */}
         
          </div>}

         />
      </ChatViewComponentCard>
    </div>
  );
}

export default ChatViewComponentTest;

const ChatViewComponentCard = styled(Section)`
  height: 80vh;
  position:relative;
`;
//c2d544ad9d1efd5c5a593b143bf8232875c926cf28015564e70ad078b95f807e
//4ac5ab85c9c3d57adbdf2dba79357e56b2f9ef0256befe750d9f93af78d2ca68
