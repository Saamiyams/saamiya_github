import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";

// 1. Define constants
const connectButton = document.getElementById("connect-button");
const sendTransactionButton = document.getElementById("send-transaction-button");

const projectId = import.meta.env.VITE_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide VITE_PROJECT_ID env variable");
}

// 2. Create modal client
export const web3Modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "Demo Wallet Connect",
    description: "Demo sending message to a wallet",
    url: "http://localhost:5173/"
  },
});

var sessions = [];
var accounts = [];

async function onSessionConnect(session){
  if(!session) throw Error("session is not created");
  try {
    sessions.push(session);
    accounts.push(session.namespaces.eip155.accounts[0].slice(9));
  } catch(e){
    console.log(e)
  }
}

// 4. Connect
async function handleConnect() {
  try {
    connectButton.disabled = true;

    const proposalNamespace = {
      eip155: {
        methods: ["personal_sign", "eth_sendTransaction"],
        //using Polygon Mumbai (80001) for testing. Use eip155:137 for Polygon.
        chains: ["eip155:80001"],
        events: ["connect", "disconnect"],
      },
    }

    console.log("proposalNamespace: ");
    console.log(proposalNamespace);

    const session = await web3Modal.connect({
      requiredNamespaces: proposalNamespace,
    })

    console.log("approvedNamespace: ");
    console.log(session.namespaces);
    
    onSessionConnect(session);
    sendTransactionButton.disabled = false;
  } catch (err) {
    connectButton.disabled = false;
    console.error(err);
  }
}

async function handleSend() {
  try {
    if(!sessions[0]){
      alert("No session found. First connect to wallet");
      sendTransactionButton.disabled = true;
      return;
    }

    const msg = [
      "Hello world",
      "0x1268f9145F9F1EE920D5CDcd556f94a8507562dc"
    ];

    console.log("msg");
    console.log(msg);

    const result = await web3Modal.request({
      topic: sessions[0].topic,
      request: {
        method: "personal_sign",
        params: msg
      },
      chainId: "eip155:80001"
    })
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

// 6. Create connection handler
connectButton.addEventListener("click", handleConnect);
sendTransactionButton.addEventListener("click", handleSend);