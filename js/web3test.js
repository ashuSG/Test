// window.addEventListener('load', function() {

//     // Checking if Web3 has been injected by the browser (Mist/MetaMask)
//     if (typeof web3 !== 'undefined') {
//         // Use Mist/MetaMask's provider
//         window.web3 = new Web3(web3.currentProvider);
//     } else {
//         console.log('No web3? You should consider trying MetaMask!')
//         // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
//         window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//         //window.web3 = new Web3(new Web3.providers.HttpProvider("https://proxy.mobilefish.com:9070"));
//     }

//     // Now you can start your app & access web3 freely:
//     startWeb3();
// })

// function startWeb3(){
//     showNetwork();
//     showAccounts();
//     showVersionNode();
//     showFunctionSignature();
// }

// function showNetwork(){
//     window.web3.version.getNetwork((err, res) => {
//         var output = "";
//         if (!err) {
//             if(res > 1000000000000) {
//                 output = "testrpc";
//             } else {
//                 switch (res) {
//                 case "1":
//                     output = "mainnet";
//                     break
//                 case "2":
//                     output = "morden";
//                     break
//                 case "3":
//                     output = "ropsten";
//                     break
//                 case "4":
//                     output = "rinkeby";
//                     break
//                 default:
//                     output = "unknown network = "+res;
//                 }
//             }
//         } else {
//             output = "Error";
//         }
//         console.log("[web3.version.getNetwork] Network = " + output);
//         // document.getElementById('network').innerHTML = "[web3.version.getNetwork] Network = " + output + "<br />";
//     })
// }
  
// function showAccounts(){
//     window.web3.eth.getAccounts((err, res) => {
//         var output = "";

//         if (!err) {
//             output = res.join("<br />");
//         } else {
//             output = "Error";
//         }
//         console.log("[web3.eth.getAccounts] Accounts = " + output);
//     })
// }

// function showVersionNode() {
//     web3.version.getNode((err, res) => {
//         var output = "";

//         if (!err) {
//             output = res;
//         } else {
//             output = "Error";
//         }
//         console.log("[web3.version.getNode] The client/node version = " + output);
//     })
// }

// function showFunctionSignature() {
//     var abi = [{"constant":true,"inputs":[],"name":"isFunding","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ETHWallet","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxMintable","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"exchangeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"closeContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenAddress","type":"address"}],"name":"setup","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_buyer","type":"address"},{"name":"_value","type":"uint256"}],"name":"contributeEther","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"totalMinted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"Token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"contribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_wallet","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Contribution","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"ContributeEther","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"address"}],"name":"SenderLogger","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"uint256"}],"name":"ValueLogger","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"address"}],"name":"Setup","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"","type":"uint256"}],"name":"totalMinted","type":"event"}];
//     var MyContract = web3.eth.contract(abi);
//     var myContractInstance = MyContract.at('0x60C2de00738bB271AecD6cf6F3ca59024e7aC390');
//     // var result = myContractInstance.contribute.get();
//     var result = web3.sha3('contribute()');
//     console.log("function signature = " + result);

//     // var test1 = web3.sha3('releaseHeldCoins()');
//     // console.log("function signature = " + test1);
//   }