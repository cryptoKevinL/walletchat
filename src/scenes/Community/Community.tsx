import {
   Box,
   Heading,
   Flex,
   Button,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'

import { InboxItemType } from '../../types/InboxItem'
import TabContent from './components/TabContent'
import InboxSkeleton from './components/InboxSkeleton'
import { useUnreadCount } from '../../context/UnreadCountProvider'
import InboxSearchInput from './components/InboxSearchInput'
import { getIpfsData } from '../../services/ipfs'

const localStorageInbox = localStorage.getItem('inbox')

const Inbox = ({
   account,
   web3,
   isAuthenticated,
}: {
   account: string
   web3: Web3
   isAuthenticated: boolean
}) => {
   const [inboxData, setInboxData] = useState<InboxItemType[]>(
      localStorageInbox ? JSON.parse(localStorageInbox) : []
   )
   const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
   const [communities, setCommunities] = useState<InboxItemType[]>()
   const { unreadCount } = useUnreadCount()

   useEffect(() => {
      const interval = setInterval(() => {
         getInboxData()
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [isAuthenticated, account, inboxData])

   useEffect(() => {
      setCommunities(inboxData.filter((d) => d.context_type === 'community' && !(d.chain === 'none')))
   }, [inboxData])

   useEffect(() => {
      getInboxData()
   }, [isAuthenticated, account])

   const getInboxData = () => {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!account) {
         console.log('No account connected')
         return
      }
      if (!isAuthenticated) {
         console.log('Not authenticated')
         return
      }
      setIsFetchingInboxData(true)
      fetch(` ${process.env.REACT_APP_REST_API_IPFS}/get_inbox/${account}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
         .then((response) => response.json())
         .then(async (data: InboxItemType[]) => {
            if (data === null) {
               setInboxData([])
               localStorage.setItem('inbox', JSON.stringify([]))
            } else if (equal(inboxData, data) !== true) {
               console.log('✅[GET][Inbox ipfs]:', data)

               const replica = JSON.parse(JSON.stringify(data));
               //console.log("Filtered data ipfs: ", replica);

               //Get data from IPFS and replace the message with the fetched text
               for (let i = 0; i < replica.length; i++) {
                  if(replica[i].message != "") {
                     console.log('requesting CID inbox:', replica[i].message)
                     const rawmsg = await getIpfsData(replica[i].message)
                     console.log('raw IPFS returned data ipfs :', rawmsg)
                     replica[i].message = rawmsg
                  }
               }
               //console.log("Replica datazzzz: ", replica);
               setInboxData(replica)
               localStorage.setItem('inbox', JSON.stringify(replica))
            }
            setIsFetchingInboxData(false)
         })
         .catch((error) => {
            console.error('🚨[GET][Inbox]:', error)
            setIsFetchingInboxData(false)
         })
   }

   if (isFetchingInboxData && inboxData.length === 0) {
      return <InboxSkeleton />
   }

   return (
      <Box
         background="white"
         height={isMobile ? 'unset' : '100vh'}
         borderRight="1px solid var(--chakra-colors-lightgray-400)"
         width="360px"
         maxW="100%"
         overflowY="scroll"
         className="custom-scrollbar"
      >
         <Box
            px={5}
            pt={5}
            pb={3}
            pos="sticky"
            top="0"
            background="white"
            zIndex="sticky"
         >
            <Flex justifyContent="space-between" mb={2}>
               <Heading size="lg">Communities</Heading>
            </Flex>
            {/* <InboxSearchInput /> */}
         </Box>

         <TabContent context="communities" data={communities} web3={web3} account={account} />
      </Box>
   )
}

export default Inbox
