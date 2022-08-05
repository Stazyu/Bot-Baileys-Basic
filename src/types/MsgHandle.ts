import { GroupMetadata, GroupParticipant, MessageUpsertType, proto } from "@adiwajshing/baileys";

export interface ISimplified {
    chatMessage?: proto.IMessage | null | undefined;
    content: string;
    from?: string | null | undefined;
    fromMe?: boolean | null | undefined;
    id?: string | null | undefined;
    isGroup?: boolean;
    participant?: string | null | undefined;
    type?: keyof proto.Message | null;
    body?: string | null;
    messageTimeStamp?: number | Long.Long | null | undefined;
    quotedInfo?: proto.IContextInfo | null | undefined;
    quotedType?: string | null;
    botNumber: string;
    mentions?: string[] | null | undefined;
    prefix: string;
    runtime: string;
    time: string;
    date: string;
    user_id?: string | null | undefined;
    owner: string[];
    pushName?: string | null | undefined;
    ownerNumber?: string[];
    isOwner: boolean;
    groupMetadata?: GroupMetadata | null;
    groupName?: string | null | undefined;
    groupId?: string | null | undefined;
    groupMembers: GroupParticipant[] | null | undefined;
    groupDesc?: string | null | undefined;
    groupAdmins: string[];
    isBotGroupAdmin: boolean;
    isGroupAdmin: boolean;

    isMedia: boolean;
    isAudio: boolean;
    isImage: boolean;
    isVideo: boolean;
    isSticker: boolean;
    isDocument: boolean;
    isButtonMessage: boolean;
    isButtonResponseMessage: boolean;
    isTemplateButtonReplyMessage: boolean;
    isQuotedAudio: boolean;
    isQuotedImage: boolean;
    isQuotedVideo: boolean;
    isQuotedSticker: boolean;
    isQuotedDocument: boolean;
    isQuotedMedia: boolean;

    message_prefix?: string | null;
    message_button?: string | null | undefined;
    message_chat?: string | null | undefined;
    message: string | null | undefined;

    command?: string | null | undefined;
    args: string[];
    far: string | null;
    isCmd: boolean;

    grettingTime: string;
}

export interface Message {
    messages: proto.IWebMessageInfo[],
    type: MessageUpsertType
}