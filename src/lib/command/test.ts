import { ICommand } from "../../types/ICommand";
import { ISimplified } from '../../types/MsgHandle';
import { sendText } from '../../utils/functions';

export default class Command implements ICommand {
    msg: ISimplified;
    constructor(msg: ISimplified) {
        this.msg = msg
    }

    name = 'Testing';
    command = ['test']
    category = 'testing';
    isOwner = false;
    isGroupAdmin = false;
    description = '';
    execute() {
        sendText(this.msg.from!, 'Mantap bos')
    }
}