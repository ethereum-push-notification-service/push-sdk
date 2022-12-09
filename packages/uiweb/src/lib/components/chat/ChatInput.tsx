import React, { ChangeEvent, useContext, useRef, useState } from 'react';
import { ReactComponent as SendIcon } from '../../icons/chat/sendIcon.svg';
import SmileyIcon from '../../icons/chat/smiley.svg';
import AttachmentIcon from '../../icons/chat/attachment.svg';
import styled, { ThemeConsumer } from 'styled-components';
import * as PushAPI from '@pushprotocol/restapi';
import { ChatMainStateContext, ChatPropsContext } from '../../context';
import { Spinner } from './Spinner';
// import Picker from 'emoji-picker-react';

export const ChatInput: React.FC = () => {
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filesUploading, setFileUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { account, env, supportAddress, apiKey, theme } =
    useContext<any>(ChatPropsContext);

  const {
    messageBeingSent,
    message,
    setMessage,
    setToastMessage,
    setToastType,
    connectedUser,
    chats,
    setChatsSorted,
  } = useContext<any>(ChatMainStateContext);

  const addEmoji = (e: any, emojiObject: any): void => {
    setMessage(message + emojiObject.emoji);
    setShowEmojis(false);
  };

  const handleSubmit = async (e: {
    preventDefault: () => void;
  }): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    if (message.trim() !== '' && connectedUser) {
      const sendResponse = await PushAPI.chat.send({
        messageContent: message,
        messageType: 'Text',
        receiverAddress: supportAddress,
        account: account,
        pgpPrivateKey: connectedUser?.privateKey,
        apiKey,
        env,
      });

      if (typeof sendResponse !== 'string') {
        sendResponse.messageContent = message;
        setChatsSorted([...chats, sendResponse]);
        setMessage('');
        setLoading(false);
      } else {
        setToastMessage(sendResponse);
        setToastType('error');
      }
    }
  };

  const handleKeyPress = (e: any): void => {
    const x = e.keyCode;
    if (x === 13) {
      handleSubmit(e);
    }
  };

  const textOnChange = (e: any): void => {
    if (!messageBeingSent) {
      setMessage(e.target.value);
    }
  };

  const uploadFile = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const TWO_MB = 1024 * 1024 * 2;
        if (file.size > TWO_MB) {
          setToastMessage('Cannot upload file over 2MB');
          setToastType('error');
          return;
        }
        setFileUploading(true);
        const messageType = file.type.startsWith('image') ? 'Image' : 'File';
        const reader = new FileReader();
        let fileMessageContent: any;
        reader.readAsDataURL(file);
        reader.onloadend = async (e): Promise<void> => {
          fileMessageContent = {
            content: e.target!.result as string,
            name: file.name,
            type: file.type,
            size: file.size,
          };
          // call restapi send
          // send {msgType: messageType}
          setFileUploading(false);
        };
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <Container theme={theme}>
      {messageBeingSent ? (
        <ItemHV2>Loading...</ItemHV2>
      ) : (
        <>
          {/* <Image
            src={SmileyIcon}
            alt="Send File"
            height="32px"
            width="32px"
            onClick={(): void => setShowEmojis(!showEmojis)}
          /> */}
          {/* {showEmojis && (
            <Picker
              onEmojiClick={addEmoji}
              pickerStyle={{
                width: '300px',
                position: 'absolute',
                bottom: '2.5rem',
                zindex: '700',
                left: '2.5rem',
              }}
            />
          )} */}
          {
            <TextInput
              placeholder="Type your message..."
              onKeyDown={handleKeyPress}
              onChange={textOnChange}
              value={message}
            />
          }

          <>
            <label>
              {/* <Image
                src={AttachmentIcon}
                alt="Send File"
                height="30px"
                width="30px"
              /> */}
              {/* <FileInput type="file" ref={fileInputRef} onChange={uploadFile} /> */}
            </label>

            {filesUploading || loading ? (
              <Spinner size="35" />
            ) : (
              <SendIcon onClick={handleSubmit} fill={theme.btnColorPrimary} />
            )}
          </>
        </>
      )}
    </Container>
  );
};

//styles
const Button = styled.button``;

const Image = styled.img`
  display: flex;
  max-height: initial;
  vertical-align: middle;
  overflow: initial;
  cursor: pointer;
  height: ${(props: any): string => props.height || '24px'};
  width: ${(props: any): string => props.width || '20px'};
  justify-content: flex-end;
`;

const Span = styled.span`
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #1e1e1e;
  margin-left: 27%;
  flex: none;
  order: 0;
  flex-grow: 0;
`;

const Container = styled.div`
  padding: 8px 10px 8px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${(props: any): string => props.theme.bgColorPrimary || '#fff'};
  border: ${(props) => props.theme.border};
  margin: 10px 0;
  border-radius: 16px;
`;

const Icon = styled.i`
  padding: 0px;
  display: flex;
  margin-left: 5px;
  &:hover {
    cursor: pointer;
  }
`;

const TextInput = styled.textarea`
  font-family: 'Strawford';
  font-size: 16px;
  width: 100%;
  height: 25px;
  outline: none;
  padding-top: 4px;
  border: none;
  resize: none;
  background: transparent;
  color: black;
  &&::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  ::placeholder {
    color: #494d5f;
  }
`;

const GifDiv = styled.div`
  background: #f7f8ff;
  padding: 5px 8px 5px 6px;
  border-radius: 7px;
`;

const FileInput = styled.input`
  display: none;
`;

const ItemHV2 = styled.div`
  position: absolute;
  top: 0;
  right: 10px;
  bottom: 0;
  justifycontent: flex-end;
  background: transparent;
`;
