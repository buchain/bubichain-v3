
'use strict';


function currentTimeMills() {
    let consensus = consensusValue;
    return parseInt(consensus.close_time / 1000);
}

function getAmount(address) {
    let metadata = callBackGetAccountMetaData(thisAddress, address);
    if (metadata) {
        return metadata.value;
    }
    return 0;
}


function getSeq() {
    let metadata = callBackGetAccountMetaData(thisAddress, 'seq');
    if (metadata) {
        return parseInt(metadata.value);
    }
    return 0;
}

/**
 * 设置账户metadata
 */
function setMetaData(key, value)
{
    //assert(typeof key === 'string', 'Args type error. key must be a string.');

    if(value === undefined){
        return false;
    }

    let transaction = {
        'operations': [{
            'type': 4,
            'set_metadata': {'key': key, 'value': JSON.stringify(value )}
        }]
    };
    
    let isSuccess = callBackDoOperation(transaction);
    if (!isSuccess) {
        return false;
    }
    
    return true;
}



function issue(input) {

    let data = input;

    let amount = data.amount;
    if (amount <= 0) {
        throw '金额必须大于0';
    }

    let from = data.from;
    let to = data.to;

    let seq = getSeq() + 1;
    //let seq = transactions.length;
    let issue_data = {
        'from': from,
        'to': to,
        'amount': amount,
        'seq': seq,
        'actionTime': currentTimeMills()
    };
    if(data.hasOwnProperty('cpcSeq')){
        issue_data.cpcSeq = data.cpcSeq;
    }
    //transactions.push(issue_par);
    let transaction = {
        'operations': [{
            'type': 4,
            'set_metadata': {'key': to, 'value': amount}
        }, {
            'type': 4,
            'set_metadata': {'key': 'seq', 'value': seq}
        }, {
            'type': 4,
            'set_metadata': {'key': 'tx_'+seq, 'value': JSON.stringify(issue_data)}
        }]
    };

    let isSuccess = callBackDoOperation(transaction);
    if (!isSuccess) {
        throw '合约执行登记失败';
    }
}


function transfer(input) {
    let data = input;

    if(sender !== data.from){
        throw '非本人进行的转账';
    }
    let transferAmount = data.amount;
    if (transferAmount <= 0) {
        throw '转出金额必须大于0';
    }

    let to = data.to;
    let from = data.from;


    let balance_to = getAmount(to);
    let balance_from = getAmount(from);

    if (balance_from <= 0) {
        throw '转让人余额不足';
    }

    if (balance_from < transferAmount) {
        throw '转让金额必须大于等于转让金额';
    }

    //let transactions = getTransactions();
    let seq = getSeq() + 1;
    let transfer_data = {
        'from': from,
        'to': to,
        'amount': transferAmount,
        'seq': seq,
        'actionTime': currentTimeMills()
    };

    let transaction = {
        'operations': [{
            'type': 4,
            'set_metadata': {'key': from, 'value': parseInt(balance_from) - transferAmount}
        }, {
            'type': 4,
            'set_metadata': {'key': to, 'value': parseInt(balance_to) + transferAmount}
        }, {
            'type': 4,
            'set_metadata': {'key': 'seq', 'value': seq}
        },{
            'type': 4,
            'set_metadata': {'key': 'tx_'+seq, 'value': JSON.stringify(transfer_data)}
        }]
    };

    let isSuccess = callBackDoOperation(transaction);
    if (!isSuccess) {
        throw '合约执行转让失败';
    }
}



function main(inputData) {
    callBackLog('inputData: ' + inputData);
    let input;
    try {
        input = JSON.parse(inputData);
    } catch (error) {
        return;
    }

    let action = input.action;
    switch (action) {
        case 'issue':
            issue(input);
            break;
        case 'transfer':
            transfer(input);
            break;  
        default:
            throw '无效的操作类型';
    }
}