export const addedMessage = (msgData: any, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    setMessages(prevMessages => [msgData, ...prevMessages]);
}

export const updatedMessage = (msgData: any, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    setMessages(prevMessages => prevMessages.map(msg => msg._id === msgData._id ? msgData : msg));
}

export const deletedMessage = (msgId: any, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg._id !== msgId));
}

 const handleMessageFromServer = (value: any, setMessages: React.Dispatch<React.SetStateAction<any[]>>, errorToaster: any) => {
    console.log("Tohande", value)
    const { event,  data } = JSON.parse(value);
    switch (event) {
        case 'msg:create':
            addedMessage(data, setMessages);
            break;
        case 'msg:update':
            updatedMessage(data, setMessages);
            break;
        case 'msg:delete':
            deletedMessage(data, setMessages);
            break;
        case 'msg:error':
            errorToaster(data);
            break;
        default:
            break;
    }
    return{ event, data};
}

export default handleMessageFromServer;