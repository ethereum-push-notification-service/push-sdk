import { ChatProfile } from "@pushprotocol/uiweb";

export const ChatProfileTest = () => {

    return (
        <div>
            <ChatProfile 
                chatProfileLeftHelperComponent={<div>left component</div>}
                chatProfileRightHelperComponent={<div>right component</div>}
                chatId='monalisha.wallet'
// chatId='d9c2d6fa7132d49ea6d1b570f0ebd2bcc45c1ecac726eab993ad91c574fbe3c6'
            />
        </div>
    )
}
