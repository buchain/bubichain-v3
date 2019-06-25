English | [中文](Dev_Manual_CN.md) 

# Development Manual
 
## Table of Contents

<!-- TOC -->

- [Test Network](#test-network)
    - [Environment of Chain A](#environment-of-chain-a)
        - [Block Info](#block-info)
        - [Address of Communication Contract](#address-of-communication-contract)
        - [Address of Asset Contract](#address-of-asset-contract)
    - [Environment of Chain B](#environment-of-chain-b)
        - [Block Info](#block-info)
        - [Address of Communication Contract](#address-of-communication-contract)
        - [Address of Asset Contract](#address-of-asset-contract)
- [Experiencing Cross-chain](#experiencing-cross-chain)
    - [Issuing an asset on Chain A](#issuing-an-asset-on-chain-a)
    - [Transferring the Asset from Chain A to the Communication Contract](#transferring-the-assets-from-chain-a-to-the-communication-contract)
    - [Triggering the Communication Contract by Chain A](#triggering-the-communication-contract-by-chain-a)
    - [Checking the Status of the Communication Contract on Chain B](#checking-the-status-of-the-communication-contract-on-chain-b)
    - [Checking the Status of the Asset Contract on Chain B](#checking-the-status-of-the-asset-contract-on-chain-b)
    - [Checking the Final Status of Chain A](#checking-the-final-status-of-chain-a)

- [Development Instruction](#development-instruction)
    - [Notary Program](#notary-program)
    - [Communication Contract](#communication-contract)
    - [Asset Contract](#asset-contract)
    - [Deployment Instruction](#deployment-instruction)
        - [Deploying the Chain](#deploying-the-chain)
        - [Deploying the Notary](#deploying-the-notary)
        - [Deploying Contracts](#deploying-contracts)
        - [Deploying the Chain](#deploying-the-chain)

<!-- /TOC -->

The infrastructure of a single blockchain is booming, but there is an isolated island of value between various chains. We are committed to creating a lightweight, secure protocol for cross-chain asset transfer that allows assets to move freely.

At present, we have designed and implemented a protocol for cross-chain asset transfer, and got it running on two test BUChains. Now we invite you to experience and use it, and provide your valuable advice.

## Test Network
At present, we have built two chains, chain A and chain B, and they have corresponding asset contracts and communication contracts. The communication contract is responsible for the message interaction between two chains, ensuring the atomicity and validity of the interaction; the asset contract is the implementation of the corresponding business in which the actual asset transfer occurs, and the user can customize the business of any mode, such as asset transfer in a 1:1 ratio, and asset exchange in a 1: N ratio, etc. 


| | Environment for Chain A | Environment for Chain B
|:--- | ---  | --- 
| Block Info | http://52.80.81.176:10002/getLedger | http://52.80.81.176:20002/getLedger
|Address of Communication Contract| [a00168ba...](http://52.80.81.176:10002/getAccount?address=a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 "a00168ba...")  |[a0010cc417...](http://52.80.81.176:20002/getAccount?address=a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 "a0010cc417...") 
| Address of Asset Contract | [a0023006...](http://52.80.81.176:10002/getAccount?address=a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e "a0023006...")  | [a0021217...](http://52.80.81.176:20002/getAccount?address=a002121795274745cfa2d56577b15781c5fb5627458bc2 "a0021217...") 



## Experiencing Cross-chain

With the test chain we built, we can quickly experience cross-chain asset transfer. We will show you how to operate in the following sector. In order to compile and debug, we use Postman to send messages in which the private key is in plain text. In production environment, it is not suggested to use Postman to send a transaction in case the private key is lost.

### Issuing an asset on Chain A

The first step is to issue an asset in chain A. We issue an asset with an amount of 10,000,000 in the asset contract of Chain A `a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e`.
{
  "items": [
    {
      "transaction_json": {
        "source_address": "a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec", 
        "nonce": 1, 
        "operations": [
          {
            "type": 3, 
            "payment": {
              "dest_address": "a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e", 
              "input": "{\"action\":\"issue\",\"from\":\"a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec\",\"to\":\"a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec\",\"amount\":10000000}"
            }
          }
        ]
      }, 
      "private_keys": [
        "c001ab8accaa32d24e36cbab6fbc2abce67f59c65f3dcff87c7ec58fb7b8bc710ad4b8"
      ]
    }
  ]
}	

You can check the asset transaction result with the following interface http://52.80.81.176:10002/getAccount?address=a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e 

Example:
```
{
    key: "tx_1",
    value: "{"
    from ":"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    to ":"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    amount ":10000000,"
    seq ":1,"
    actionTime ":1561011118108}",
    version: 1
},
```

### Transferring the Asset from Chain A to the Communication Contract

The second step is to transfer the asset to the communication contract `a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e` which will lock the asset.
```
{
  "items": [
    {
      "transaction_json": {
        "source_address": "a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec", 
        "nonce": 2, 
        "operations": [
          {
            "type": 3, 
            "payment": {
              "dest_address": "a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e", 
              "input": "{\"action\":\"transfer\",\"from\":\"a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec\",\"to\":\"a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60\",\"amount\":50}"
            }
          }
        ]
      }, 
      "private_keys": [
        "c001ab8accaa32d24e36cbab6fbc2abce67f59c65f3dcff87c7ec58fb7b8bc710ad4b8"
      ]
    }
  ]
}

```

You can check the asset transaction result with the following interface http://52.80.81.176:10002/getAccount?address=a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e. 

Example:
```
{
    key: "tx_2",
    value: "{"
    from ":"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    to ":"
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    amount ":50,"
    seq ":2,"
    actionTime ":1561011198494}",
    version: 1
}
```

### Triggering the Communication Contract by Chain A

The third step is to inform the communication contract `a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e` to form the proposal.
```
{
  "items": [
    {
      "transaction_json": {
        "source_address": "a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec", 
        "nonce": 6, 
        "operations": [
          {
            "type": 3, 
            "payment": {
              "dest_address": "a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60", 
              "input": "{\"function\":\"sendCrossChain\",\"f_assets_addr\":\"a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e\",\"from\":\"a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec\",\"to\":\"a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386\",\"amount\":50,\"t_assets_addr\":\"a002121795274745cfa2d56577b15781c5fb5627458bc2\",\"seq\":2}"
            }
          }
        ]
      }, 
      "private_keys": [
        "c001ab8accaa32d24e36cbab6fbc2abce67f59c65f3dcff87c7ec58fb7b8bc710ad4b8"
      ]
    }
  ]
}	

```
You can check the asset transaction result with the following interface http://52.80.81.176:10002/getAccount?address=a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60.
例如：

```
{
    key: "send_proposal_1",
    value: "{"
    proposal ":{"
    seq ":1,"
    amount ":50,"
    from ":"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    to ":"
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    f_assets_addr ":"
    a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e ","
    t_assets_addr ":"
    a002121795274745cfa2d56577b15781c5fb5627458bc2 ","
    f_comm_addr ":"
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    t_comm_addr ":"
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    f_chain_id ":"
    CHAIN_20190528_A ","
    t_chain_id ":"
    CHAIN_20190528_B "},"
    state ":1," //The status of the proposal. 1 indicates initializing, 2 processing, 3 failure, and 4 success.
    vote ""  //Proposal feedback record
}
```

### Checking the Status of the Communication Contract on Chain B

After the transaction is done, check the status of the communication contract on chain B http://52.80.81.176:20002/getAccount?address=a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 

The result is as follows:
```
{
    key: "receive_proposal_1",
    value: "{"
    proposals ":[["
    a001e5c2e5142c2b57e72dd5783b383eabfdf4f4e4f6bb ",1,50,"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e ","
    a002121795274745cfa2d56577b15781c5fb5627458bc2 ","
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    CHAIN_20190528_A ","
    CHAIN_20190528_B "],["
    a001ce7acd9c7cb6b9bd6acaeecaaa0d7ff240241a9d15 ",1,50,"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e ","
    a002121795274745cfa2d56577b15781c5fb5627458bc2 ","
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    CHAIN_20190528_A ","
    CHAIN_20190528_B "],["
    a001ce7acd9c7cb6b9bd6acaeecaaa0d7ff240241a9d15 ",1,50,"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e ","
    a002121795274745cfa2d56577b15781c5fb5627458bc2 ","
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    CHAIN_20190528_A ","
    CHAIN_20190528_B "]],"
    state ":4,"
    vote_count ":3}",
    version: 2
}
```

### Checking the Status of the Asset Contract on Chain B

Meanwhile, check the new asset for cross-chain in the asset contract of Chain B  http://52.80.81.176:20002/getAccount?address=a002121795274745cfa2d56577b15781c5fb5627458bc2

The result is as follows:

```
{
    key: "tx_1",
    value: "{"
    from ":"
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    to ":"
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    amount ":50,"
    seq ":1,"
    actionTime ":1561012460941,"
    cpcSeq ":1}",
    version: 1
}
```

### Checking the Final Status of Chain A

In chain A, you can see the communication proposal for this asset, which is completed.

You can check with the following interface http://52.80.81.176:10002/getAccount?address=a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60.

The result is as follows:
```
{
    key: "send_proposal_1",
    value: "{"
    proposal ":{"
    seq ":1,"
    amount ":50,"
    from ":"
    a00138e97b736f16d1342d67fe5cbcceb1638ffc52d6ec ","
    to ":"
    a002b8467e03f6771c7e9dda09f9a7027b33fdf9a62386 ","
    f_assets_addr ":"
    a00230068c4eab8c26dd1cd140390fd09f9ffa9706845e ","
    t_assets_addr ":"
    a002121795274745cfa2d56577b15781c5fb5627458bc2 ","
    f_comm_addr ":"
    a00168babf35f0feac4854bb1fcc79d0235edfa87d0b60 ","
    t_comm_addr ":"
    a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0 ","
    f_chain_id ":"
    CHAIN_20190528_A ","
    t_chain_id ":"
    CHAIN_20190528_B "},"
    state ":4," //Feedback is successful, with the indicator 4
    vote ":[["
    a001e5c2e5142c2b57e72dd5783b383eabfdf4f4e4f6bb ",4]],"
    vote_count ":1}",
    version: 2
}
```

## Development Instruction

The implementation of the notary mechanism is divided into two parts, one is the notary program, and the other is the communication contract and the asset contract.

### Notary Program

The notary program deals mainly with contracts for chain A and Chain B and implements the interaction process according to the rules of the protocol. Implemented in C++, [Contents of Code] (https://github.com/zjg555543/bubichain-v3/tree/feature/crosschain/src/notary "Contents of Code")

### Communication Contract

https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_comm.js

### Asset Contract

https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_asset.js

## Deployment Instruction

The deployment of chain A and chain B refers to the deployment of the BUChain. [Deployment Documentation] (https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/manual.md "Deployment Documentation"), it should be noted that you need to configure the configuration file with the notary program. [Configuration File] (https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/build/win32/config/bubi.json "Configuration File")

### Deploying the Chain

```
"cross": {
    "comm_unique": "CHAIN_20190528_A",  //The ID of the chain is the same as the ID in the corresponding communication contract.
    "comm_contract": "a0010cc417e4dfa7a952347980842d2d37f99a3ae190b0", //Address of the communication contract
    "target_addr": "127.0.0.1:30000", //Listening port of the notary program
    "enabled": true
}
```

### Deploying the Notary

After the compilation is complete, run the `notary` program, and you need to pay attention to its [Configuration File] (https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/build/win32/config/notary. Json "profile")

```
{
    "logger": {
        "path": "log/notary.log",
        "dest": "FILE|STDOUT|STDERR",
        "level": "TRACE|INFO|WARNING|ERROR|FATAL",
        "time_capacity": 1,
        "size_capacity": 10,
        "expire_days": 10
    },
    "notary": {
        "notary_address": "a001c3bbfce78bba8bfcb37113a84e95a3fd441a5622e3",
        "private_key": "c0018d7939ec4085db3db6a2c698a6b30345301d81b6b53a700f4865a8c51f479149ee",
        "listen_addr": "127.0.0.1:30000"//Listening port of the notary
    },
    "pair_chain_1": {
        "comm_unique": "CHAIN_20190528_A",//Communication contract ID of chain A 
        "comm_contract": "a00200c3a5b881e0c729ae167fa43cf7778eb18eda3754"//Communication contract address of chain A 
    },
    "pair_chain_2": {
        "comm_unique": "CHAIN_20190528_B",//Communication contract ID of chain B
        "comm_contract": "a00136bc18029f74548c1a1b9ae8a2449a43d93ce19184"//Communication contract ID of chain B
    }
}
```

### Deploying Contracts

- [Creating Communication Contracts for Chain A](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/0-CreateAChainCom.txt "Creating Communication Contracts for Chain A")
- [Creating Asset Contracts for Chain A](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/0-CreateAChainAsset.txt "Creating Asset Contracts for Chain A")
- [Creating Communication Contracts for Chain B](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/0-CreateBChainComm.txt "Creating Communication Contracts for Chain B")
- [Creating Asset Contracts for Chain B](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/0-CreateBChainAsset.txt "Creating Asset Contracts for Chain B")
- [Initializing Communication Contracts for Chain A](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/1-InitAChainComm.txt "Initializing Communication Contracts for Chain A")
- [Initializing Communication Contracts for Chain B](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/1-InitBChainComm.txt "Initializing Communication Contracts for Chain A")
- [Issuing Assets on Chain A](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/2-CrossIssueAChainAsset.txt "Issuing Assets on Chain A")
- [Transferring Assets from Chain A to Communication Contracts](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/2-CrossTransAChainAsset.txt "Transferring Assets from Chain A to Communication Contracts")
- [Triggering Communication Contracts](https://github.com/zjg555543/bubichain-v3/blob/feature/crosschain/docs/cross_chain/cross_step/2-CrossTransAChainComm.txt "Triggering Communication Contracts")
