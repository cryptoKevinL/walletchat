import { Encrypted } from 'eth-crypto'

// export default interface MessageType {
//    message: string
//    fromAddr: string
//    toAddr: string
//    timestamp: Date,
//    read: boolean
//    id?: number
// }


interface MessageSkeletonType {
   message: string
   fromaddr: string
   timestamp: Date
   read: boolean
   id?: number
}

export interface MessageType extends MessageSkeletonType {
   toaddr: string
   nftaddr: string
   nftid: number
}

export interface GroupMessageType extends MessageSkeletonType {
   nftaddr: string
}

export interface MessageUIType {
   message: string
   fromAddr: string
   toAddr?: string
   timestamp: Date,
   read?: boolean
   id?: number,
   img?: string,
   position: string,
   isFetching: boolean
   unread?: number,
   nftAddr: string | null,
   nftId?: number | null
}

export interface SettingsType {
   walletaddr: string
   publickey: string
}

export interface EncryptedMsgBlock {
   to: Encrypted
   from: Encrypted
}
