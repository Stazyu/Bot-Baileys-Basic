import { ISimplified } from './MsgHandle';
export interface ICommand {
    name: string
    command: string[]
    category: string
    isOwner: boolean
    isGroupAdmin: boolean
    description: string
    execute(): void
}