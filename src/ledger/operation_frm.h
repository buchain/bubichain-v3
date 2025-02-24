﻿
#ifndef OPERATION_FRM_H_
#define OPERATION_FRM_H_

#include <utils/common.h>
#include <common/general.h>
#include <ledger/account.h>
#include "transaction_frm.h"

#include "environment.h"
namespace bubi{

	class TransactionFrm;
	class AccountEntry;
	class OperationFrm {
	protected:
		protocol::Operation operation_;
		TransactionFrm* transaction_;
		int32_t	index_;
		Result result_;
		std::shared_ptr<AccountFrm> source_account_;
	public:

		OperationFrm(const protocol::Operation &operation, TransactionFrm* tran, int32_t index = 0);
		~OperationFrm();

		Result Apply(std::shared_ptr<Environment> txenvironment);

		bool CheckSignature(std::shared_ptr<Environment> txenvironment);

		Result GetResult() const;

		static Result CheckValid(const protocol::Operation& ope, const std::string &source_address);
	protected:
		void CreateAccount(std::shared_ptr<Environment> environment);
		void IssueAsset(std::shared_ptr<Environment> environment);
		void Payment(std::shared_ptr<Environment> environment);
		void SetMetaData(std::shared_ptr<Environment> environment);
		void SetSignerWeight(std::shared_ptr<Environment> environment);
		void SetThreshold(std::shared_ptr<Environment> environment);
		void PayCoin(std::shared_ptr<Environment> environment);
		//void OperationDeployContract(Environment *environment);
		//void InvokeContract(Environment *environment);
	};
};
#endif
