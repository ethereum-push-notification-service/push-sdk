import { ChatProfile } from "@pushprotocol/uiweb";

export const ChatProfileTest = () => {

    return (
        <div>
            <ChatProfile 
                component={<div>Some component</div>}
                chatId='0x455E5AA18469bC6ccEF49594645666C587A3a71B'
// chatId='36baf37e441fdd94e23406c6c716fc4e91a93a9ee68e070cd5b054534dbe09a6'
           
            />
        </div>
    )
}
