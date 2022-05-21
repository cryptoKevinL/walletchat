import createMetaMaskProvider from 'metamask-extension-provider'
import WalletAccount from './wallet'

let _accounts: WalletAccount[] | null = []
let provider = createMetaMaskProvider()
provider.on('accountsChanged', handleAccountsChanged)
let runCounter = 0

chrome.alarms.create({ periodInMinutes: 0.1 })
chrome.alarms.onAlarm.addListener(() => {
    console.log('alarm duuuude wake up')
    runCounter++
    console.log(runCounter)
})

provider
   .request({ method: 'eth_accounts' })
   .then(handleAccountsChanged)
   .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err)
   })

chrome.runtime.onMessage.addListener((data) => {
   console.log('chrome.runtime.onMessage', data)
   if (data.type === 'notification') {
      notify(data.message)
   }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
         `Storage key "${key}" in namespace "${namespace}" changed.`,
         `Old value was "${oldValue}", new value is "${newValue}".`
      )
   }
})

chrome.runtime.onInstalled.addListener((details) => {
   console.log('[background.ts] onInstalled', details)

   chrome.contextMenus.create({
      id: 'notify',
      title: 'WalletChat: %s',
      contexts: ['selection'],
   })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
   if ('notify' === info.menuItemId) {
      if (info.selectionText) {
         notify(info.selectionText)
      }
   }
})

const notify = (message: string) => {
   chrome.storage.local.get(['notifyCount'], (data) => {
      let value = data.notifyCount || 0
      chrome.storage.local.set({ notifyCount: Number(value) + 1 })
   })

   return chrome.notifications.create('', {
      type: 'basic',
      title: 'WalletChat',
      message: message || 'Enter your message here',
      iconUrl: './assets/icons/128.png',
   })
}

chrome.runtime.onConnect.addListener((port) => {
   console.log('[background.ts] onConnect', port)

   console.log("onConnect")
   // chrome.alarms.get('periodic', a => {
   //    if (!a) chrome.alarms.create('periodic', { periodInMinutes: 0.25 });
   //  });
})

chrome.runtime.onSuspend.addListener(() => {
   console.log("onSuspend")
   console.log('[background.ts] onSuspend')
})

chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) => {
   console.log("Received message from " + sender + ": ", request);
   sendResponse({ received: true }); //respond however you like
});

function reloadSettings() {

   if (_accounts != null) {
      _accounts.forEach((account) => {
         account.stopScheduler()
      })
      _accounts = null
   }
   _accounts = new Array<WalletAccount>()
   chrome.browserAction.setBadgeText({ text: '...' })
   chrome.browserAction.setTitle({ title: 'Polling accounts...' })

   window.setTimeout(startRequest, 0)
}

function handleAccountsChanged(accounts: any) {
   console.log('handleAccountsChanged()', accounts)

   if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.')
   } else {
      // Stop all old account schedulers
      if (_accounts != null) {
         _accounts.forEach((acc: WalletAccount) => {
            console.log('stop address: ', acc)
            if (acc) {
               acc.stopScheduler()
            }
         })
      }

      // Start new account schedulers
      let accts = new Array<WalletAccount>()
      accounts.forEach((address: string) => {
         console.log('start address: ', address)
         let acc = new WalletAccount(address)
         acc.onError = walletError;
         acc.onUpdate = walletUpdate;
         accts.push(acc)
      })
      _accounts = accts
      startRequest()
   }
}

function startRequest() {
   if (_accounts !== null) {
      _accounts.forEach((account, i) => {
         if (account != null) {
            window.setTimeout(account.startScheduler, 500 * i)
         }
      })
   }
}

function walletUpdate() {
   let unreadCount = 0

   if (_accounts !== null) {
      _accounts.forEach((account) => {
         if (account != null && account.getUnreadCount() > 0) {
            unreadCount += account.getUnreadCount()
         }
      })
   }

   switch (unreadCount) {
      case 0:
         chrome.action.setBadgeBackgroundColor({
            color: [110, 140, 180, 255],
         })
         chrome.action.setTitle({ title: 'No unread messages' })
         chrome.action.setBadgeText({ text: "" })
         break
      case 1:
         chrome.action.setBadgeBackgroundColor({
            color: "#F00",
         })
         chrome.action.setTitle({
            title: unreadCount + ' unread message',
         })
         chrome.action.setBadgeText({ text: unreadCount.toString() })
         break
      default:
         chrome.action.setBadgeBackgroundColor({
            color: "#F00",
         })
         chrome.action.setTitle({
            title: unreadCount + ' unread messages',
         })
         chrome.action.setBadgeText({ text: unreadCount.toString() })
         break
   }
}

// Called when an account has experienced an error
function walletError() {
   chrome.browserAction.setBadgeBackgroundColor({ color: [190, 190, 190, 255] })
   chrome.browserAction.setBadgeText({ text: 'X' })
   chrome.browserAction.setTitle({ title: 'Wallet not connected' })
}

export {}
