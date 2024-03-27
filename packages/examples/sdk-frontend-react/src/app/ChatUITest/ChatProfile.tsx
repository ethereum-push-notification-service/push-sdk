import { ChatProfile } from "@pushprotocol/uiweb";

export const ChatProfileTest = () => {

    return (
        <div>
            <ChatProfile 
                chatProfileLeftHelperComponent={<div>left component</div>}
                chatProfileRightHelperComponent={<div>right component</div>}
                chatId='monalisha.wallet'
// chatId='36baf37e441fdd94e23406c6c716fc4e91a93a9ee68e070cd5b054534dbe09a6'
            />
        </div>
    )
}
