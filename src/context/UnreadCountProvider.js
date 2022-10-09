import React, { useCallback, useEffect } from 'react'
import equal from 'fast-deep-equal/es6'
import { useWallet } from './WalletProvider'

import { get } from  "../services/api"
import { setCookie } from '../helpers'  

export const UnreadCountContext = React.createContext()
export const useUnreadCount = () => React.useContext(UnreadCountContext)

export function withUnreadCount(Component) {
   const WalletComponent = (props) => (
      <UnreadCountContext.Consumer>
         {(contexts) => <Component {...props} {...contexts} />}
      </UnreadCountContext.Consumer>
   )
   return WalletComponent
}

const UnreadCountProvider = React.memo(({ children }) => {
   const [unreadCount, setUnreadCount] = React.useState(0)
   const [totalUnreadCount, setTotalUnreadCount] = React.useState(0)
   const { account } = useWallet()

   const getUnreadCount = useCallback(() => {
      if (account) {
         
         get(`/unreadcount/${account}`)
            .then((data) => {
               if (!equal(data, unreadCount)) {
                  console.log('✅[GET][Unread Count]:', data)
                  let total_cnt = Object.values(data).reduce((a, b) => a + b);
                  setCookie("_wallet_chat_msg_cnt",total_cnt,1)
                  let msg = {
                     "data": total_cnt,
                     "target": "unread_cnt"
                  }
                  window.parent.postMessage(msg, "*");
                  setUnreadCount(data)
                  if (typeof data === 'object') {
                     setTotalUnreadCount(data?.dm + data?.nft + data?.community)
                  }
               }
            })
            .catch((error) => {
               console.error('🚨[GET][Unread Count]:', error)
               let msg = {
                  "data": 69,
                  "target": "unread_cnt"
               }
               window.parent.postMessage(msg, "*");
            })
      }
   }, [account, unreadCount])

   useEffect(() => {
      getUnreadCount()
   }, [getUnreadCount])

   useEffect(() => {
      const interval = setInterval(() => {
         getUnreadCount()
      }, 5000) // every 5s

      return () => {
         clearInterval(interval)
      }
   }, [account, unreadCount, getUnreadCount])

   return (
      <UnreadCountContext.Provider
         value={{
            unreadCount,
            setUnreadCount,
            totalUnreadCount
         }}
      >
         {children}
      </UnreadCountContext.Provider>
   )
})

export default UnreadCountProvider
