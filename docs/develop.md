# 布比区块链开发文档

<!-- TOC -->

- [布比区块链开发文档](#布比区块链开发文档)
    - [基础知识](#基础知识)
        - [了解protocol buffer3](#了解protocol-buffer3)
        - [protocol buffer 3和json](#protocol-buffer-3和json)
        - [websocket和http](#websocket和http)
        - [交易执行的基本过程](#交易执行的基本过程)
        - [试一试](#试一试)
    - [HTTP接口](#http接口)
        - [查询账号](#查询账号)
        - [查询交易](#查询交易)
        - [查询区块头](#查询区块头)
        - [提交交易](#提交交易)
        - [序列化交易](#序列化交易)
        - [配置验证节点](#配置验证节点)
    - [定义交易](#定义交易)
        - [交易的基本结构](#交易的基本结构)
        - [操作](#操作)
            - [操作码](#操作码)
            - [创建账号](#创建账号)
            - [发行资产](#发行资产)
            - [转移资产](#转移资产)
            - [设置metadata](#设置metadata)
            - [设置权重](#设置权重)
            - [设置门限](#设置门限)
    - [高级功能](#高级功能)
        - [控制权的分配](#控制权的分配)
        - [版本化控制](#版本化控制)
        - [表达式](#表达式)
        - [合约](#合约)
            - [内置函数](#内置函数)
            - [内置变量](#内置变量)
            - [异常处理](#异常处理)
    - [错误码](#错误码)
    - [示例](#示例)

<!-- /TOC -->

## 基础知识

### 了解protocol buffer3

布比区块链是用protocol buffer 3序列化数据的，protocol buffer 3是google推出的数据序列化协议，您如果不了解protocol buffer 3，请点击[https://developers.google.com/protocol-buffers/docs/proto3](https://developers.google.com/protocol-buffers/docs/proto3)了解更多。
我们使用的所有数据格式都能在源码的```src\proto```目录中找到。其中chain.proto文件中定义的数据是和交易、区块、账号密切相关的。

### protocol buffer 3和json

http接口中的数据都是json格式的，这些格式都是由protocolbuffer自动转化的。由于json中无法直接使用不可见字符, 凡是protocolbuffer结构定义中为**bytes**的，在json中都是16进制格式。

### websocket和http

布比区块链提供了websocket和http 两种API接口。您可以在 安装目录/config/bubi.json 文件种找到`"webserver"`和`"wsserver"`两个对象,它们指定了http服务端口和websocket服务端口。

```json
    "webserver":
    {
        "listen_addresses": "0.0.0.0:29333",
        "remote_authorized": false
    },
    "wsserver":
    {
        "listen_address": "0.0.0.0:7053"
    }
```

### 交易执行的基本过程

1. 根据意愿组装交易对象`Transaction`
1. 交易对象序列化(protocol buffer 3格式)为字节流 `transaction_blob`
1. 用私钥`skey`对`transaction_blob`签名得到`sign_data`，`skey`的公钥为`pkey`
1. 提交交易，见[提交交易](#提交交易)
1. 查询以确定交易是否成功或接收推送（websocket API）判断交易是否成功

### 试一试

如果您的区块链刚刚部署完成，那么目前区块链系统中只有创世账号。您可以通过http接口查询创世账号
`HTTP GET host:29333/getGenesisAccount`
您会得到类似这样的返回内容

```json
{
   "error_code" : 0,
   "result" : {
      "address" : "a002d8345b89dc34a57574eb497635ff125a3799fe77b6",
      "assets" : null,
      "balance" : 100000000000000000,
      "metadatas" : null,
      "priv" : {
         "master_weight" : 1,
         "thresholds" : {
            "tx_threshold" : 1
         }
      }
   }
}
```

返回结果中的`address`的值就是创世账号。
您还可以通过[查询账号](#查询账号)接口查询任意账号

```text
HTTP GET host:29333/getAccount?address=a002d8345b89dc34a57574eb497635ff125a3799fe77b6
```

## HTTP接口

### 查询账号

```text
HTTP GET /getAccount?address=a002423c235a7ba9649347ff85b6be1c51980d1eff0398&key=hello&code=xxx&issuer=xxx
```

功能:返回指定账号的信息及其所有资产、metadata

| 参数         | 描述                                                                                                                                                    |
| :----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| address      | 账号地址， 必填                                                                                                                                         |
| key          | 账号的 metadata 中指定的key的值，如果不填写，那么返回结果中含有所有的metadata                                                                           |
| code, issuer | 资产代码,资产发行商。这两个变量要么同时填写，要么同时不填写。若不填写，返回的结果中包含所有的资产。若填写，返回的结果中只显示由code和issuer指定的资产。 |

返回内容

```json
{
  "error_code" : 0,
  "result" : {
    "address" : "a002423c235a7ba9649347ff85b6be1c51980d1eff0398", //该账号的地址
    "assets" : [//该账号的所有资产
      {
        "amount" : 1400,
        "property" :
        {
          "code" : "CNY",
          "issuer" : "a002423c235a7ba9649347ff85b6be1c51980d1eff0398"
        }
      }, {
        "amount" : 1000,
        "property" :
        {
          "code" : "USD",
          "issuer" : "a002423c235a7ba9649347ff85b6be1c51980d1eff0398"
        }
      }
    ],
    "assets_hash" : "9696b03e4c3169380882e0217a986717adfc5877b495068152e6aa25370ecf4a",
    "contract" : null,
    "metadatas" : [//该账号的所有metadata
      {
        "key" : "123",
        "value" : "123_value",
        "version" : 1
      }, {
        "key" : "456",
        "value" : "456_value",
        "version" : 1
      }, {
        "key" : "abcd",
        "value" : "abcd_value",
        "version" : 1
      }
    ],
    "nonce" : 1, //账号当前作为交易源执行过的交易数量。若nonce为0，该字段不显示
    "priv" : {
      "master_weight" : 1,
      "thresholds" : {
        "tx_threshold" : 1
      }
    },
    "storage_hash" : "82c8407cc7cd77897be3100c47ed9d43ec4097ee1c00e2c13447187e5b1ac66c"
  }
}

```

- 如果该账号不存在,则返回内容

```json
{
   "error_code" : 4,
   "result" : null
}
```

### 查询交易

```text
GET /getTransactionHistory?hash=ad545bfc26c440e324076fbbe1d8affbd8a2277858dc35927d425d0fe644e698&ledger_seq=2
```

| 参数       | 描述                     |
| :--------- | ------------------------ |
| hash       | 用交易的唯一标识hash查询 |
| ledger_seq | 查询指定区块中的所有交易 |
上述两个参数产生的约束条件是逻辑与的关系，如果您同时指定两个参数，系统将在指定的区块中查询指定的交易

返回示例

```json
{
    "error_code": 0,
    "result": {
        "total_count": 1, //本次查询结果，交易的数量
        "transactions": [ //每一个交易
            {
                "close_time": 1506477535974465,
                "error_code": 0,
                "hash": "8e97ab885685d68b8fa8c7682f77ce17a85f1b4f6c8438eda8ec955890919405",
                "ledger_seq": 108,
                "signatures": [ //本交易的签名
                    {
                        "public_key": "b00204e1c7dddc36d3153adcaa451b0ab525d3def48a0a10fdb492dc3a7263cfb88e80ee974ca4da0e1f322aa84ff9d11340c764ea756ad148e979c121619e9fe52e9054",
                        "sign_data": "2f6612eaefbdadbe792201bb5d1e178aff118dfa0a640edb2a8ee91933efb97c4fb7f97be75195e529609a4de9b890b743124970d6bd7072b7029cfe7683ba2d"
                    },
                    {
                        "public_key": "b00204e6e93bf0c8e0b2e0099cd54a677bcbeefa888c6bad992f55c05ba7f8169286963ae6968fc48c3c6b6a65827f2e9d604176a17919dfc665e8ea78a461c518757bb9",
                        "sign_data": "a94f94eb57fd7d1d879d3c621c1f6eb7c9ad00ab3fb90f1eb0a8435adef8c1a95f3064808c0654ed0a4a25c7aa7fda488fd591eae60e06bd7b6195892016a595"
                    }
                ],
                "transaction": { //交易的内容
                    "nonce": 1,
                    "operations": [
                        {
                            "create_account": {
                                "contract": {
                                    "payload": "function main(inputStr){\n /*这是合约入口函数*/ }"
                                },
                                "dest_address": "a002f866c7f415e7194a926118cc55e4ce999eb29b164a",
                                "metadatas": [
                                    {
                                        "key": "hello",
                                        "value": "这是创建账号的过程中设置的一个metadata"
                                    }
                                ],
                                "priv": {
                                    "master_weight": 10,
                                    "thresholds": {
                                        "tx_threshold": 7
                                    }
                                }
                            },
                            "type": 1
                        }
                    ],
                    "source_address": "a002d8345b89dc34a57574eb497635ff125a3799fe77b6"
                }
            }
        ]
    }
}
```

如果没有查到交易则返回

```json
{
  "error_code": 4,
  "result":
  {
    "total_count": 0,
    "transactions": []
  }
}
```

### 查询区块头

```text
GET /getLedger?seq=xxxx&with_validator=true&with_consvalue=true
```

| 参数           | 描述                                      |
| :------------- | ----------------------------------------- |
| seq            | ledger的序号， 如果不填写，返回当前ledger |
| with_validator | 默认false，不显示验证节点列表       |
| with_consvalue | 默认false，不显示共识值             |

- 如果查询到ledger则返回内容:

```json
{
   "error_code" : 0,
   "result" : {
      "consensus_value" : {//当with_consvalue=true时才会显示
         "close_time" : 1506478618406358,//共识结果产生的时间
         "ledger_seq" : 136,//共识出来的区块号
         "previous_ledger_hash" : "f7096c0d7b85e766a459c9d0eb8756268d560270c7a1cf51fc0371baaa6573f4",//上一个区块序号
         "previous_proof" : "0aff010a2d080110022a2708011087012220f38b06d6fb8a825b537105e60e089f474b90f41de01ef43367c64553604d198612cd010a8801623030323034316136633636343233373139373465613061663862366636393136353230343964366262396539653363663739383363363763613362336563616538363337346565306465616665666563393432383138303936613335313335343635373861346632643761623664353133396339323737656264306634633931623563643739641240032efd35b8ea647dc9e687d7a79dc43344d8f58e9329070334778c70b2d7574b40fd26a9660f9f5240c93a123baaff70c6df812ac095e1b5e44790ca29ed4e1e",
         "previous_proof_plain" : {
            "commits" : [
               {
                  "pbft" : {
                     "commit" : {
                        "sequence" : 135,
                        "value_digest" : "f38b06d6fb8a825b537105e60e089f474b90f41de01ef43367c64553604d1986",
                        "view_number" : 1
                     },
                     "round_number" : 1,
                     "type" : 2
                  },
                  "signature" : {
                     "public_key" : "b002041a6c6642371974ea0af8b6f691652049d6bb9e9e3cf7983c67ca3b3ecae86374ee0deafefec942818096a3513546578a4f2d7ab6d5139c9277ebd0f4c91b5cd79d",
                     "sign_data" : "032efd35b8ea647dc9e687d7a79dc43344d8f58e9329070334778c70b2d7574b40fd26a9660f9f5240c93a123baaff70c6df812ac095e1b5e44790ca29ed4e1e"
                  }
               }
            ]
         },
         "txset" : null
      },
      "header" : {
         "account_tree_hash" : "d8a04da7daad5eb911c285ec56a4a5434d66af22f29f42b74373908c3efe64e0", //账号树的hash
         "close_time" : 1506478618406358, //本区块生成的时间
         "consensus_value_hash" : "5067eda92d887ce90f7f96b8ed1a000bd69755905286ed092fda00175e781a07", //共识结果的hash
         "hash" : "9a3c4dc78b40eaa18b962688b24a57b160d93703e9cfaef88c0a27bdff369bee",//本区块的hash
         "previous_hash" : "f7096c0d7b85e766a459c9d0eb8756268d560270c7a1cf51fc0371baaa6573f4",//上一个区块的hash
         "seq" : 136, //区块的序号
         "tx_count" : 1, //截止到当前区块，所有交易的数量
         "validators_hash" : "b744ccae0ecd1b0c09923564bc1556949e96f78755bdbcec06a82ddad420cca4", //共识节点集合的hash
         "version" : 3000 //区块版本
      },
      "validators" : [ "a002953b57b025662c9f9de93df4c319cc39bec181c2b5" ]//with_validator=true时才显示，共识节点集合
   }
}
```

- 如果没有查询到ledger返回的内容:

``` json
{
   "error_code" : 4,
   "result" : null
}
```

### 提交交易

```text
POST /submitTransaction
```

数据格式

```json
{
  "items" : [{
      "transaction_blob" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",//一个交易序列化之后的16进制表示
      "signatures" : [{//第一个签名
          "sign_data" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",//签名数据
          "public_key" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"//公钥
        }, {//第二个签名
          "sign_data" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",//签名数据
          "public_key" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"//公钥
        }
      ]
    }
  ]
}
```

| 参数             | 描述|
| :--------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transaction_blob | 交易序列化之后的16进制格式。您可以参照[定义交易](#定义交易)来组装自己的交易数据                                                                                 |
| sign_data        | 签名数据， 16进制格式。其值为对transaction_blob进行签名(动词)得到的签名数据。__注意，签名时要先将transaction_blob转成字节流再签名，不要对16进制字符串直接签名__ |
| public_key       | 公钥， 16进制格式。|

>#### 当您提交交易后, 您提交的那个节点会给该交易加1个签名，证明是该节点将这个交易扩散到区块链网络中的。您查询交易时，会发现交易多了1条签名，这个签名就是节点添加的。

### 序列化交易

如果您手中还没有protocol buffer工具，您可以使用本接口将交易序列化。

| 参数           | 描述                                                                                                    |
| :------------- | ------------------------------------------------------------------------------------------------------- |
| source_address | 必填，交易的发起方账号地址                                                                              |
| nonce          | 必填，交易序号，必须等于发起方账号的nonce+1。您可以通过[查询账号](#查询账号)返回的结果中得到账号的nonce |
| expr_condition | 表达式字段, 可选                                                                                        |
| metadata       | 可选, 用户自定义交易的备注数据, 必须为16进制表示                                                        |

关于operations中的数据格式，参照[操作](#操作)下面各种不同的操作的**json格式**

```http
POST /getTransactionBlob
```

```json
{
    "source_address":"xxxxxxxxxxx",//交易源账号，即交易的发起方
    "nonce":2, //nonce值
    "expr_condition":"", //可选，表达式。参见高级功能:表达式
    "metadata":"0123456789abcdef", //可选，用户自定义给交易的备注，16进制格式
    "operations":[
    {
      //根据不同的操作填写
    },
    {
      //根据不同的操作填写
    }
    ......
    ]
}
```

返回内容

```json
{
    "error_code": 0,
    "error_desc": "",
    "result": {
        "hash": "474210d69cf0a797a24be65e187eddc7f15de626d38f8b49446b21ddd12247f8",//交易的hash
        "transaction_blob": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" //交易序列化之后的16进制表示
    }
}
```

>例如，定义了1个json格式的交易，该交易只有1个操作，创建一个账号
`POST /getTransactionBlob`

```json
{
  "source_address": "a002d8345b89dc34a57574eb497635ff125a3799fe77b6",
  "nonce": 1,
  "operations": [{
      "type": 1,
      "create_account": {
        "dest_address": "a002f866c7f415e7194a926118cc55e4ce999eb29b164a",
        "metadatas": [{
            "key": "hello",
            "value": "这是创建账号的过程中设置的一个metadata"
          }
        ],
        "priv": {
          "master_weight": 10,
          "signers": [],
          "thresholds": {
            "tx_threshold": 7
          }
        },
        "contract": {
          "payload": "function main(inputStr){\n /*这是合约入口函数*/ }"
        }
      }
    }
  ]
}
```

返回

```json
{
    "error_code": 0,
    "error_desc": "",
    "result": {
        "hash": "8e97ab885685d68b8fa8c7682f77ce17a85f1b4f6c8438eda8ec955890919405",
        "transaction_blob": "0a2e61303032643833343562383964633334613537353734656234393736333566663132356133373939666537376236100122b90108012ab4010a2e61303032663836366337663431356537313934613932363131386363353565346365393939656232396231363461123a123866756e6374696f6e206d61696e28696e707574537472297b0a202f2ae8bf99e698afe59088e7baa6e585a5e58fa3e587bde695b02a2f207d1a06080a1a020807223e0a0568656c6c6f1235e8bf99e698afe5889be5bbbae8b4a6e58fb7e79a84e8bf87e7a88be4b8ade8aebee7bdaee79a84e4b880e4b8aa6d65746164617461"
    }
}
```

### 配置验证节点
```http
POST /confValidator?add=a00252641e461a28e0f2d19e01fa9ce4ba89af24d5f0c6&del=a0027fb6fd8e8ffbf64cf10efebd9278735d5e39a6325e
```

body 数据格式

```json
{
    "validator_conf_key": "420979ee02ce8778d6ff1c2e426e0c7a7c73a7eb59cecc6da3cb07e6757bf1bb",//这里填写的是一个hash值，是validator_conf_key（bubi.json中配置项）+timestamp(下面的参数)的SHA256生成的
    "timestamp": 1521681457285 // 本地时间戳，与节点系统时间戳相差不能超过1天
}
```

|参数|描述
|:--- | --- 
|add |逗号分隔的需要添加的验证节点列表
|del |逗号分隔的需要删除的验证节点列表

注：1. 当body不为空时，验证validator_conf_key; 当body为空时，本操作必须由本机回环地址提交。 

   2. 需要大部分的（三分之二以上）验证节点都执行添加/删除操作，且共识成功后才能添加/删除成功。


## 定义交易

### 交易的基本结构

- json格式
  ```json
  {
      "source_address":"xxxxxxxxxxx",//交易源账号，即交易的发起方
      "nonce":2, //nonce值
      "expr_condition":"", //可选，表达式。参见高级功能:表达式
      "metadata":"0123456789abcdef", //可选，用户自定义给交易的备注，16进制格式
      "operations":[
      {
      //根据不同的操作填写
      },
      {
      //根据不同的操作填写
      }
      ......
      ]
  }
  ```
- protocol buffer 结构
  ```text
  message Transaction
  {
      enum Limit{
              UNKNOWN = 0;
              OPERATIONS = 1000;
      };
      string source_address = 1;
      int64 nonce = 2;
      string expr_condition = 3;
      repeated Operation operations = 4;
      bytes metadata = 5;
      int64  fee = 6;
  }
  ```

  交易Transaction有5个关键字段

  - source_address: 交易源账号，即交易发起方的账号。当这笔交易成功后，交易源账号的nonce字段会自动加1。账号中的nonce意义是本账号作为交易源执行过的交易数量。
  - nonce:其值必须等于交易源账号的当前nonce+1，这是为了防止重放攻击而设计的。如何查询一个账号的nonce可参考[查询账号](#查询账号)。若查询账号没有显示nonce值，说明账号的当前nonce是0.
  - expr_condition:针对本交易的表达式，高级功能。详见[表达式](#表达式)
  - operations:操作列表。本交易的有效负载，即本交易想要做什么事情。见[操作](#操作)
  - metadata:用户自定义字段，可以不填写，备注用。

  Operation是所有操作的父类:

  ```text
  message Operation
  {
      enum Type {
          UNKNOWN = 0;
          CREATE_ACCOUNT = 1;
          ISSUE_ASSET = 2;
          PAYMENT = 3;
          SET_METADATA = 4;
          SET_SIGNER_WEIGHT = 5;
          SET_THRESHOLD = 6;
          PAY_COIN = 7;
      };
      Type type = 1;
      string source_address = 2;
      bytes metadata = 3;
      string expr_condition = 4;

      OperationCreateAccount create_account = 5;
      OperationIssueAsset issue_asset = 6;
      OperationPayment payment = 7;
      OperationSetMetadata set_metadata = 9;
      OperationSetSignerWeight set_signer_weight = 10;
      OperationSetThreshold set_threshold = 11;
      OperationPayCoin pay_coin = 12;
  }
  ```

  - type: 操作类型的枚举。如其值为ISSUE_ASSET（发行资产），那么本操作中的issue_asset字段就会被使用；如果其值为PAYMENT，那么本操作中payment字段就会被使用……详见[操作码](#操作码)
  - source_address:操作源，即本操作针对哪个账号生效。若不填写，则默认本操作源等于本操作源。
  - metadata:本操作的备注，用户自定义，可以不填写
  - expr_condition:针对本操作的表达式，若您用不着这个功能，可以不填写。详见[表达式](#表达式)

### 操作

#### 操作码

| 代码值 | 枚举名            | 说明         |
| :----- | ----------------- | ------------ |
| 1      | CREATE_ACCOUNT    | 创建账号     |
| 2      | ISSUE_ASSET       | 发行资产     |
| 3      | PAYMENT           | 转移资产     |
| 4      | SET_METADATA      | 设置metadata |
| 5      | SET_SIGNER_WEIGHT | 设置权重     |
| 6      | SET_THRESHOLD     | 设置门限     |

#### 创建账号

|参数|描述
|:--- | --- 
|dest_address |  账号的地址
|contract|  如果不填写，那么这是一个普通的账号。如果填写，那么这是一个合约账号
| priv|  该账号的权限信息

- 功能
  在区块链上创建一个新的账号
- 成功条件
  - 各项参数合法
  - 要创建的账号不存在
- json格式


```json
    {
      "type": 1,
      "create_account": {
        "dest_address": "a0026f43f60f511c8260b9ded0c830de6109b3bbeb06c7",
        "contract": {
          "payload": "function main(input) { /*do what ever you want*/ }"
        },
        "metadatas": [{
            "key": "111",
            "value": "hello 111!",
            "version": 0
          }, {
            "key": "222",
            "value": "hello 222!",
            "version": 0
          }
        ],
        "priv": {
          "master_weight": 10,
          "signers": [{
              "address": "a002d225e3e52fa8b341105d2109c0be0a90749ee42b21",
              "weight": 6
            }
          ],
          "thresholds": {
            "tx_threshold": 7,
            "type_thresholds": [{
                "type": 1,
                "threshold": 8
              }, {
                "type": 2,
                "threshold": 5
              }
            ]
          }
        }
      }
    }
```

- protocol buffer 结构

  ```text
  message OperationCreateAccount
  {
      string dest_address = 1;
      Contract contract = 2;
      AccountPrivilege priv = 3;
      repeated KeyPair metadatas = 4;
      int64    init_balance = 5;
  }
  ```

  - dest_address:要创建的账号的地址
  - contract:合约。若你想要创建一个不具有合约功能的账号，可以不填写这部分。若您想创建具有合约功能的账号，请参照[合约](#合约)
  - priv: 账号的初始权力分配。相关的数据结构定义:
      ```text
        message OperationTypeThreshold
        {
            Operation.Type type = 1;
            int64 threshold = 2;
        }

        message AccountPrivilege
        {
            int64 master_weight = 1;
            repeated Signer signers = 2;
            AccountThreshold thresholds = 3;
        }
        message Signer
        {
            enum Limit
            {
                SIGNER_NONE = 0;
                SIGNER = 100;
            };
            string address = 1;
            int64 weight = 2;
        }
        message AccountThreshold
        {
            int64 tx_threshold = 1; //required, [-1,MAX(INT64)] -1: 表示不设置
            repeated OperationTypeThreshold type_thresholds = 2; //如果这个设置，则操作门限以这个为准
        }
        ```

    若你想创建一个不受其他账号控制的账号。将priv.master_weight设置为1，将`priv.thresholds.tx_threshold`设为1即可。若您想创建一个受其他账号控制的账号，参见[控制权的分配](#控制权的分配)

  - metadatas:metadata列表。您可以为新建的账号设置一批初始的metadata。其数据类型为KeyPair,结构如下

    ```text
    message KeyPair
    {
        string key = 1;
        string value = 2;
        int64 version = 3;
    }
    ```

    这是一个版本化的键值对数据库，如果您不需要，可以不填写这部分。
  - init_balance:暂时未启用

#### 发行资产

|参数|描述
|:--- | --- 
|amount |  发行的数量
|code|  资产代码

- 功能
  操作源账号发行一笔数字资产，执行成功后操作源账号的资产余额中会出现这一笔资产
- 成功条件
  - 各项参数合法
  - 资产数量没有溢出（int64）
- json格式

    ```json
    {
      "type": 2,
      "issue_asset": {
        "amount": 1000,
        "code": "CNY"
      }
    }
    ```
- protocol buffer 结构
    ```text
    message OperationIssueAsset
    {
        string code = 1;
        int64 amount = 2;
    }
    ```
    - code:要发行的资产代码，长度范围[1, 64]
    - 发行的数量。数值范围(0,MAX(int64))
    - 执行成功后，操作源的资产表中会出现这部分新发行的资产

#### 转移资产

|参数|描述
|:--- | --- 
|payment.dest_address |  目标账户
|payment.asset.property.issuer|  资产发行方
|payment.asset.property.code|  资产代码
|payment.asset.amount|  要转移的数量
|payment.input|  触发合约调用的入参

- 功能
  操作源账号将一笔资产转给目标账号
- 成功条件
  - 各项参数合法
  - 源账号该类型的资产数量足够
- json格式


  ```JSON
    {
      "type": 3,
      "payment": {
        "dest_address": "a002f22d29d38b3a4f0afb3689f24c580529c05454a20c",
        "asset": {
          "property": {
            "issuer": "a002d5905562ba1a32d7879c73131d68c5814526ff62b4",
            "code": "CNY"
          },
          "amount": 100
        },
        "input": "{\"bar\":\"foo\"}"
      }
    }
  ```

- protocol buffer 结构
    ```text
    message OperationPayment
    {
        string dest_address = 1;

        Asset asset = 2;

        string input = 3;
    }
    ```
    - dest_address: 资产接收方账号地址
    - asset: 要转移的资产
    ```text
    message Asset
    {
         AssetProperty property = 1; //资产属性
         int64 amount = 2; //数量
    }

    message AssetProperty
    {
         string issuer = 1; //资产发行方
         string code = 2; //资产代码
    }
    ```
    - input: 本次转移触发接收方的合约，合约的执行入参就是input

#### 设置metadata
|参数|描述
|:--- | --- 
| set_metadata.key  |required，length:(0, 256]
| set_metadata.value  |optional，length:(0, 1048576]
| set_metadata.version |optional，default 0, 0：不限制版本，>0 : 当前 value 的版本必须为该值， <0 : 非法

- 功能
  操作源账号修改或添加一个metadata到自己的metadata表中
- 成功条件
  - 各项参数合法
- json格式

    ```JSON
    {
      "type": 4,
      "set_metadata": {
        "key": "abc",
        "value": "hello abc!",
        "version": 0
      }
    }
    ```
    
- protocol buffer 结构
    ```text
    message OperationSetMetadata
    {
        string key = 1;
        string value = 2;
        int64 version = 3;
    }
    ```
    - key: 主键，账号内唯一。长度范围[1,1024]
    - value: 值。长度范围[0,1M]
    - version: 版本号，可以不填写。若您想使用这个高级功能，参见[版本化控制](#版本化控制)

#### 设置权重
|参数|描述
|:--- | --- 
|master_weight |optional，default 0， -1 ： 不设置该值，0：设置master权重值为0， >0 && <= MAX(UINT32)：设置权重值为该值，其他：非法
|address |需要操作的 signer 地址，符合地址校验规则。
|weight | optional，default 0, 0 ：删除该signer，>0 && <= MAX(UINT32)：设置权重值为该值，其他：非法

- 功能
  设置签名者拥有的权重
- 成功条件
  - 各项参数合法
- json格式
  ```json
  {
    "type": 5,
    "set_signer_weight": {
      "master_weight": 2,
      "signers": [{
          "address": "a002ebe7a1c703f90f1c7ecdd7bc6bc4b3ab01f3563f80",
          "weight": 2
        }
      ]
    }
  }
    ```

- protocol buffer 结构
    ```text
    message OperationSetSignerWeight
    {
         int64 master_weight = 1; //required, [-1,MAX(UINT32)] -1: 表示不设置
         repeated Signer signers = 2; //address:weight, 如果weight 为0 表示删除这个signer
    }
    ```
    - master_weight:本账号地址拥有的权力值
    - 各个签名者的权力值, Signer的定义如下
    ```text
    message Signer
    {
    enum Limit{
            SIGNER_NONE = 0;
            SIGNER = 100;
    };
         string address = 1;
         int64 weight = 2;
    }
    ```

#### 设置门限
|参数|描述
|:--- | --- 
|tx_threshold |optional，default 0, 表示该账号的最低权限，-1: 表示不设置该值，>0 && <= MAX(INT64)：设置权重值为该值，其他：非法
|type |表示某种类型的操作  (0, 100]
|threshold | optional，default 0, 0 ：删除该类型操作，>0 && <= MAX(INT64)：设置权重值为该值，其他：非法

- 功能
  设置各个操作所需要的门限
- 成功条件
  - 各项参数合法
- json格式
    ```json
    {
      "type": 6,
      "set_threshold": {
        "tx_threshold": 7,
        "type_thresholds": [{
            "type": 1,
            "threshold": 8
          }, {
            "type": 2,
            "threshold": 5
          }
        ]
      }
    }
    ```

- protocol buffer 结构

  ```text
  message OperationSetThreshold
  {
          int64 tx_threshold = 1;
          repeated OperationTypeThreshold type_thresholds = 4; //type:threshold ，threshold:0 表示删除这个类型的type
  }
  ```

  OperationTypeThreshold的结构定义如下

  ```text
  message OperationTypeThreshold{
        Operation.Type type = 1;  //操作码，哪种操作
        int64 threshold = 2;    //代表这种操作所需的权重门限
  }
  ```

## 高级功能

### 控制权的分配

您在创建一个账号时，可以指定这个账号的控制权分配。您可以通过设置priv的值设置。下面是一个简单的例子

```json
{
    "master_weight": 70,//本地址私钥拥有的权力值 70
    "signers": [//分配出去的权力
        {
            "address": "a0023db6c3e25fb110ae596a57ebbb69900b6fda651534",
            "weight": 55    //上面这个地址拥有权力值55
        },
        {
            "address": "a002567bcf969137a7b4f910dbbde35a0de8450c641e08",
            "weight": 100    //上面这个地址拥有权力值100
        }
    ],
    "thresholds"://不同的操作所需的权力阈值
    {
        "tx_threshold": 8,//发起交易需要权力值 8
        "type_thresholds": [
            {
                "type": 1,//创建账号需要权利值 11
                "threshold": 11
            },
            {//发行资产需要权利值 21
                "type": 2,
                "threshold": 21
            },
            {//转移资产需要权力值 31
                "type": 3,
                "threshold": 31
            },
            {//设置metadata需要权利值 41
                "type": 4,
                "threshold": 41
            },
            {//变更控制人的权力值需要权利值 51
                "type": 5,
                "threshold": 51
            },
            {//变更各种操作的阈值需要权利值 61
                "type": 6,
                "threshold": 61
            }
        ]
    }
}
```

### 版本化控制

每一个账号的metadata都是一个版本化的小型数据库。版本化的特点是可以避免修改冲突的问题。

### 表达式

该表达式字段，用于自定义交易有效规则，比如设置交易在某个账户的master_weight 大于 100 有效，则填:

```JavaScript
jsonpath(account("bubiV8i6mtcDN5a1X7PbRPuaZuo63QRrHxHGr98s"), ".priv.master_weight") > 100
```

表达式可用的函数

| 参数                            | 描述                                 |
| :------------------------------ | ------------------------------------ |
| account(address)                | 获取账户信息, 返回 json 序列化字符串 |
| jsonpath(json_string, path)     | 获取json对象的属性值                 |
| LEDGER_SEQ                      | 内置变量，代表最新的区块高度         |
| LEDGER_TIME                     | 内置变量，代表最新的区块生成时间     |
| `( )` `=`                       | 嵌套括号                             |
| `*` `/`                         | 乘法、除法                           |
| `+` `-`                         | 加法、减法                           |
| `<` `<=`  `>`  `>=`  `==`  `!=` | 比较运算                             |
| `&&`                            | 与 运算                              |
| \|\|                              | 或运算                               |
| ,                               | 逗号运算                             |

>例: Alice发起了一笔交易，她想要使这笔交易在5秒内有效。她发现当前时间戳(微秒)是 `1506393720000000`，5秒之后也就是 `1506393725000000`。那么她就可以在交易中的`expr_condition`字段写上下面这句`LEDGER_TIME >= 1506393720000000 && LEDGER_TIME <= 1506393725000000`这句话的意思是，该交易只在时间范围`[1506393720000000, 1506393725000000]`内有效。过段时间之后，Alice发现当前时间已经超过1506393725000000，那么Alice就可以断定这笔交易要么已经被处理，要么已经彻底失效。

### 合约

合约是一段JavaScript代码,标准(ECMAScript as specified in ECMA-262)。合约的入口函数是main函数，您写的合约代码中必须有main函数的定义。该函数的入参是字符串input，是调用该合约的时候指定的。
下面是一个简单的例子

```javascript
function foo(bar)
{
  /*do whatever you want*/

}
function main(input)
{
  var para = JSON.parse(input);
  if (para.do_foo)
  {
    var x = {
      'hello' : 'world'
    };
    foo(x);
  }
}
```

系统提供了几个全局函数, 这些函数可以获取区块链的一些信息，也可驱动账号发起交易
**注意，自定义的函数和变量不要与内置变量和全局函数重名，否则会造成不可控的数据错误。同时禁止使用可能引发数据不一致的 Date 对象及 Math.random()函数，后续版本会从技术上限制**

#### 内置函数

- ##### 获取账号信息(不包含metada和资产)

    `callBackGetAccountInfo(address);`
     address: 账号地址

    例如
    ```javascript
    var account = callBackGetAccountInfo('a0025e6de5a793da4b5b00715b7774916c06e9a72b7c18');
    /*
    account具有如下格式
     {
        "address": "a002943cede1be5fb0ca0da9f9b49b0ce20b613357524a",
        "assets_hash": "5aef61a8988ce2be1da67cf4b37717748c352b8e4a0bdad2ad0964f80aca0101",
        "contract": null,
        "priv": null,
        "storage_hash": "e4775fb7fc2a5a06a4bbe0e63f362f8e24ff7752f0259ccd2fe1fc2e6e68781a"
      }
    */
    ```

- ##### 获取某个账号的metadata信息
  `callBackGetAccountMetaData(account_address, metadata_key);`
  - account_address: 账号地址
  - metadata_key: metadata的key
  ```javascript
  var bar = callBackGetAccountMetaData('a0025e6de5a793da4b5b00715b7774916c06e9a72b7c18','abc');
  /*
    bar的值是如下的格式
    {
        'key':'abc',
        'value':'hello world',
        'version':12
    }
  */

  ```
    即可得到账号a0025e6de5a793da4b5b00715b7774916c06e9a72b7c18的metadata中abc的值

- ##### 获取某个账号的资产信息

    `callBackGetAccountAsset(account_address, asset_property);`

    - account_address: 账号地址
    - asset_property: 资产属性

    例如
    ```javascript
    var asset_property =
    {
      'issuer' : 'a002bbe0b6f547d6bec2c83fb9bb93e75d37c1755f2de6',
      'code' : 'CNY'
    };
    var bar = callBackGetAccountAsset('a0025e6de5a793da4b5b00715b7774916c06e9a72b7c18', asset_property);

    /*
    {
      "amount": 1,
      "property": {
        "code": "CNY",
        "issuer": "a002bbe0b6f547d6bec2c83fb9bb93e75d37c1755f2de6"
      }
    }
    */
    ```

- ##### 获取区块信息

    `callBackGetLedgerInfo(ledger_seq);`
    - ledger_seq: 区块号

    例如
    ```javascript
    var ledger = callBackGetLedgerInfo(40);
    /*
    ledger具有如下格式
    {
        "account_tree_hash": "af05a60772cfd39f3b7838f4032f50450c100dedddf88e0132066688f6ae5c14",
        "consensus_value": {
          "close_time": 1495855656157405,
          "payload": "240398d89a5efba398fefb0dc194b45abe7b9dbc35326ee8238fff6633371004"
        },
        "hash": "9f82d8ad1c381e1ce2ce00c559fb2cf3a386d79e9414e92ce3ed809258913384",
        "ledger_sequence": 40,
        "ledger_version": 1000,
        "previous_hash": "3ff9b79479d62e7c52f2c0ab08598d219ffd4403bd5c1337764d3591e9b0ba24",
        "transaction_tree_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "tx_count": 34359738368
      }
    */

    ```

- #####  做交易
    ```javascript
    callBackDoOperation(transaction)
    ```

    令合约账号做一笔交易，即里面的任意一个操作的`source_address`都会自动变成合约账号。所以`source_address`是不需要填写的。

  - 入参: transaction, 交易
  - 返回值: true/false

    例如
    ```javascript
    var transaction =
    {
      'operations' :
      [
        {
          "type" : 2,
          "issue_asset" :
          {
            "amount" : 1000,
            "code" : "CNY"
          }
        }
      ]
    };

    var result = callBackDoOperation(transaction);
    /*result 为true或false*/
    ```

#### 内置变量

- #####  该合约账号的地址
   `thisAddress`

    全局变量`thisAddress`的值等于该合约账号的地址。

    例如账号x发起了一笔交易调用合约Y，本次执行过程中，thisAddress的值就是Y合约账号的地址。

    ```text
    var bar = thisAddress;
    /*
    bar的值是Y合约的账号地址。
    */
    ```

- ##### 调用者的地址
    sender
    ```sender``` 的值等于本次调用该合约的账号。

    例如某账号发起了一笔交易，该交易中有个操作是调用合约Y（该操作的source_address是x），那么合约Y执行过程中，sender的值就是x账号的地址。

    ```javascript
    var bar = sender;
    /*
    那么bar的值是x的账号地址。
    */
    ```

- ##### 触发本次合约的交易
    ```trigger```
    其值等于触发本次合约的交易。

    例如某账号A发起了一笔交易tx0，tx0中有一个操作是给某个合约账户转移资产(调用合约), 那么```trigger```的值就是交易tx0。

    ```javascript
    var bar = trigger;
    /*bar就是触发合约的那个交易，格式为
    {
      "signatures": [{
          "public_key": "b00204e1c7dddc36d3153adcaa451b0ab525d3def48a0a10fdb492dc3a7263cfb88e80ee974ca4da0e1f322aa84ff9d11340c764ea756ad148e979c121619e9fe52e9054",
          "sign_data": "0dd99     a8943c9c39619109898fe2fef585f3e3e482618ea8fbd589b2bbca7e303c9cc32527fd64909fee954fdb6bbef366df8b8805d3dddddf8cff7cf827928c9"
        }, {
          "public_key": "b0020482ccd10b3d76b275896f1b8f66e4c30ec097421     76069fb67f6369aac121b5d5377e23e1c9463b3c990aaabf750cad8ddcc580edf0ef38e3f70ac46bbaedaaafdfd",
          "sign_data": "2cc5ef064697a17555417e7d5a717c81fedb25937c0ae600ed45b5d7609ce935d148397f2c0ec6b1     b734be96470e4c3db690db3c6a0bd29196aee9613b9bdbc9"
        }
      ],
      "transaction": {
        "nonce": 3,
        "operations": [{
            "payment": {
              "asset": {
                "amount": 1,
                "property": {
                  "code": "CNY",
                  "issuer": "a002d8345b89dc34a57574eb497635ff125a3799fe77b6"
                }
              },
              "dest_address": "a0027b4426e6f3dc81245691f231103388bc078278a5b8"
            },
            "type": 3
          }
        ],
        "source_address": "a002d8345b89dc34a57574eb497635ff125a3799fe77b6"
      }
    }
    */
    ```

- ##### 触发本次合约调用的操作的序号
    triggerIndex

    ```triggerIndex``` 的值等于触发本次合约的操作的序号。

    例如某账号A发起了一笔交易tx0，tx0中第0（从0开始计数）个操作是给某个合约账户转移资产(调用合约), 那么```triggerIndex```的值就是0。

    ```javascript
    var bar = triggerIndex;
    /* bar 是一个非负整数*/
    ```

- ##### 本次共识数据
    ```javascript
    consensusValue
    ```
    当前块(正在生成的块)的共识数据。
    其数据结构可以在`src/proto/chain.proto`中找到ConsensusValue。
    ConsensusValue是一个protobuffer对象，根据protobuffer对象转为json格式的标准方法转换，即是```consensusValue```的值。

    ```javascript
    var bar = consensusValue;
    /*consensusValue结构比较复杂，常用的数据有以下几个:*/
    consensusValue.close_time;    /*当前时间,也就是区块生成时间*/
    consensusValue.ledger_seq;     /*当前区块序号*/
    consensusValue.previous_ledger_hash; /*上一个区块hash*/
    ```

#### 异常处理

- JavaScript异常

  当合约运行中出现未捕获的JavaScript异常时，处理规定：

  1. 本次合约执行失败，合约中做的所有交易都不会生效。
  1. 触发本次合约的这笔交易为失败。错误代码为`151`。
  >例: Bob的合约是这么写的
  ```javascript
  function main(inputStr) {
    var recvAsset = trigger.transaction.operations[triggerIndex].payment.asset;

    if (recvAsset.property.code != 'CNY' || recvAsset.property.issuer != 'a002d8345b89dc34a57574eb497635ff125a3799fe77b6') {
      throw '不支持的资产类型';
    }
    var tx = {
      'operations': [{
          'type': 3,
          'payment': {
            'dest_address': sender,
            'asset': {
              'property': {
                'issuer': thisAddress,
                'code': 'IOU'
              },
              'amount': recvAsset.amount
            }
          }
        }
      ]
    };

    var bSuccess = callBackDoOperation(tx);
    if (!bSuccess) {
      throw 'IOU卖完了';
    }
  }
  ```
  这段合约的功能就是，Bob以1：1的价格收`a002d8345b89dc34a57574eb497635ff125a3799fe77b6`发行的`CNY`,售卖自己的IOU借条(I owe you )。Alice向Bob转移一笔资产，触发了Bob的合约，如果此时Bob的IOU已经卖完，那么会执行到`throw 'IOU卖完了';`这一步。未捕获的异常会导致JavaScript代码执行出错，那么本次合约执行失败。Alice转给Bob的资产会自动回退到Alice的账户中，同时，Alice的这笔交易执行状态为失败，错误代码为`151`。

- 执行交易失败
  合约中可以执行多个交易，每个交易本身具有事物性。
  >例

  ```JavaScript
  var tx1 = {
    "operations":[
      {
        "type": 2,
        "issue_asset": {
          "amount": 1000,
          "code": "CNY"
        }
      }
    ]
  };
  var ret1 = callBackDoOperation(tx1);

  var tx2 = {
    'operations':[
      {
        "type": 1,
        "create_account": {
          "dest_address": "a0026f43f60f511c8260b9ded0c830de6109b3bbeb06c7",
          "priv": {
            "master_weight": 10,
            "thresholds": {
              "tx_threshold": 7
            }
          }
        }
      }
    ]
  };

  var ret2 = callBackDoOperation(tx2);
  ```

  如果tx1执行成功了，tx2执行失败了，那么tx2不会生效，tx1会生效。您如果需要保证事务性，请将两个交易合并起来。

## 错误码

  错误由两部分构成:
- error_code : 错误码，大概的错误分类
- error_desc : 错误描述，一般能从错误描述准确发现错误具体信息

错误列表如下:

| error_code/错误码 | 枚举名                                 | 错误描述                                                                                     |
| :---------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| 0                 | ERRCODE_SUCCESS                        | 操作成功                                                                                     |
| 1                 | ERRCODE_INTERNAL_ERROR                 | 服务内部错误                                                                                 |
| 2                 | ERRCODE_INVALID_PARAMETER              | 参数错误                                                                                     |
| 3                 | ERRCODE_ALREADY_EXIST                  | 对象已存在， 如重复提交交易                                                                  |
| 4                 | ERRCODE_NOT_EXIST                      | 对象不存在，如查询不到账号、TX、区块等                                                       |
| 5                 | ERRCODE_TX_TIMEOUT                     | TX 超时，指该 TX 已经被当前节点从 TX 缓存队列去掉，**但并不代表这个一定不能被执行**          |
| 20                | ERRCODE_EXPR_CONDITION_RESULT_FALSE    | 指表达式执行结果为 false，意味着该 TX 当前没有执行成功，**但这并不代表在以后的区块不能成功** |
| 21                | ERRCODE_EXPR_CONDITION_SYNTAX_ERROR    | 指表达式语法分析错误，代表该 TX 一定会失败                                                   |
| 90                | ERRCODE_INVALID_PUBKEY                 | 公钥非法                                                                                     |
| 91                | ERRCODE_INVALID_PRIKEY                 | 私钥非法                                                                                     |
| 92                | ERRCODE_ASSET_INVALID                  | 资产issue 地址非法                                                                           |  |  |
| 93                | ERRCODE_INVALID_SIGNATURE              | 签名权重不够，达不到操作的门限值                                                             |
| 94                | ERRCODE_INVALID_ADDRESS                | 地址非法                                                                                     |
| 97                | ERRCODE_MISSING_OPERATIONS             | 交易缺失操作                                                                                 |
| 99                | ERRCODE_BAD_SEQUENCE                   | 交易序号错误，nonce错误                                                                      |
| 100               | ERRCODE_ACCOUNT_LOW_RESERVE            | 余额不足                                                                                     |
| 101               | ERRCODE_ACCOUNT_SOURCEDEST_EQUAL       | 源和目的账号相等                                                                             |
| 102               | ERRCODE_ACCOUNT_DEST_EXIST             | 创建账号操作，目标账号已存在                                                                 |
| 103               | ERRCODE_ACCOUNT_NOT_EXIST              | 账户不存在                                                                                   |
| 104               | ERRCODE_ACCOUNT_ASSET_LOW_RESERVE      | 支付操作，资产余额不足                                                                       |
| 105               | ERRCODE_ACCOUNT_ASSET_AMOUNT_TOO_LARGE | 资产数量过大，超出了int64的范围                                                              |
| 114               | ERRCODE_OUT_OF_TXCACHE                 | TX 缓存队列已满                                                                              |
| 120               | ERRCODE_WEIGHT_NOT_VALID               | 权重值不在有效范围内                                                                         |
| 121               | ERRCODE_THRESHOLD_NOT_VALID            | 门限值不在有效范围内                                                                         |
| 144               | ERRCODE_INVALID_DATAVERSION            | metadata的version版本号不与已有的匹配（一个版本化的数据库）                                  |
| 151               | ERRCODE_CONTRACT_EXECUTE_FAIL          | 合约执行失败                                                                                 |
| 152               | ERRCODE_CONTRACT_SYNTAX_ERROR          | 合约语法分析失败                                                                             |

## 示例

下面我们用`a002d8345b89dc34a57574eb497635ff125a3799fe77b6`发起一笔交易，这笔交易只有1个操作:创建一个账号。

1. 组装交易，将交易序列化

    ```text
    POST getTransactionBlob
    ```

    ```json
    {
      "source_address": "a002d8345b89dc34a57574eb497635ff125a3799fe77b6",
      "nonce": 1,
      "operations": [{
          "type": 1,
          "create_account": {
            "dest_address": "a002f866c7f415e7194a926118cc55e4ce999eb29b164a",
            "metadatas": [{
                "key": "hello",
                "value": "这是创建账号的过程中设置的一个metadata"
              }
            ],
            "priv": {
              "master_weight": 10,
              "signers": [],
              "thresholds": {
                "tx_threshold": 7
              }
            },
            "contract": {
              "payload": "function main(inputStr){\n /*这是合约入口函数*/ }"
            }
          }
        }
      ]
    }
    ```
    得到结果

    ```json
    {
        "error_code": 0,
        "error_desc": "",
        "result": {
            "hash": "8e97ab885685d68b8fa8c7682f77ce17a85f1b4f6c8438eda8ec955890919405",
            "transaction_blob": "0a2e61303032643833343562383964633334613537353734656234393736333566663132356133373939666537376236100122b90108012ab4010a2e61303032663836366337663431356537313934613932363131386363353565346365393939656232396231363461123a123866756e6374696f6e206d61696e28696e707574537472297b0a202f2ae8bf99e698afe59088e7baa6e585a5e58fa3e587bde695b02a2f207d1a06080a1a020807223e0a0568656c6c6f1235e8bf99e698afe5889be5bbbae8b4a6e58fb7e79a84e8bf87e7a88be4b8ade8aebee7bdaee79a84e4b880e4b8aa6d65746164617461"
        }
    }
    ```

1. 我们用对`a002d8345b89dc34a57574eb497635ff125a3799fe77b6`的私钥对`transaction_blob`的值进行签名。得到签名数据
 `2f6612eaefbdadbe792201bb5d1e178aff118dfa0a640edb2a8ee91933efb97c4fb7f97be75195e529609a4de9b890b743124970d6bd7072b7029cfe7683ba2d`。

1. 将签名数据和公钥和交易blob一起提交
    ```text
    POST /submitTransaction
    ```

    ```json
    {
      "items" : [{
          "transaction_blob" : "0a2e61303032643833343562383964633334613537353734656234393736333566663132356133373939666537376236100122b90108012ab4010a2e61303032663836366337663431356537313934613932363131386363353565346365393939656232396231363461123a123866756e6374696f6e206d61696e28696e707574537472297b0a202f2ae8bf99e698afe59088e7baa6e585a5e58fa3e587bde695b02a2f207d1a06080a1a020807223e0a0568656c6c6f1235e8bf99e698afe5889be5bbbae8b4a6e58fb7e79a84e8bf87e7a88be4b8ade8aebee7bdaee79a84e4b880e4b8aa6d65746164617461",
          "signatures" : [{
              "sign_data" : "2f6612eaefbdadbe792201bb5d1e178aff118dfa0a640edb2a8ee91933efb97c4fb7f97be75195e529609a4de9b890b743124970d6bd7072b7029cfe7683ba2d",
              "public_key" : "b00204e1c7dddc36d3153adcaa451b0ab525d3def48a0a10fdb492dc3a7263cfb88e80ee974ca4da0e1f322aa84ff9d11340c764ea756ad148e979c121619e9fe52e9054"
            }
          ]
        }
      ]
    }
    ```
