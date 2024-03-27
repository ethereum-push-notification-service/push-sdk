import { ChatProfile } from "@pushprotocol/uiweb";

export const ChatProfileTest = () => {

    return (
        <div>
            <ChatProfile 
                chatProfileLeftHelperComponent={<div>left component</div>}
                chatProfileRightHelperComponent={<div>right component</div>}
                chatId='4ac5ab85c9c3d57adbdf2dba79357e56b2f9ef0256befe750d9f93af78d2ca68'
// chatId='36baf37e441fdd94e23406c6c716fc4e91a93a9ee68e070cd5b054534dbe09a6'
            />
        </div>
    )
}
