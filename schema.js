const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

schemas = {
	customers: {
		aarpMember: { type: String },
		autoDebitFlag: { type: String }, //change to boolean later
		alarmRelated: { type: String }, //change to boolean later
		batchId: { type: Number },
		customerNo: { type: Number },
		callResolution: { type: String }, //change to boolean later
		customerEffortScore: { type: Number }, //change to boolean later
		callTransferCount: { type: String }, //change to boolean later
		callRepTime: { type: String }, //change to boolean later
		checkedWebsiteFirst: { type: String }, //change to boolean later
		callDuration: { type: String },
		customerSiteTenureDays: { type: String },
		customerSiteTenureDaysNumerical: { type: Number },
		callReason: { type: String },
		contactViaChannelAgain: { type: String },
		cltv: { type: Number },
		demographicsGender: { type: String },
		demographicsState: { type: String },
		demographicsAge: { type: String }, //change to boolean later
		dropped: { type: String },
		dept: { type: String },
		dropYes: { type: Number },
		dropNo: { type: Number },
		demographicsIncome: { type: String },
		highRisk: { type: String },
		hadPriorCallsPastFiveDays: { type: String },
		hadPriorCallsPastThirtyFiveDays: { type: String },//change to boolean later
		inInitialTerm: { type: String },
		inquiryTimesCalled: { type: String },
		jobCount: { type: String }, //change to boolean later        
		jobCreated: { type: String }, //change to boolean later
		maintainRelationship: { type: String }, //change to boolean later
		monthlyCharges: { type: String },
		monthsLeftUntilContractRenewal: { type: String },
		nielsen: { type: String },
		phoneAccessibility: { type: String },
		reasonPrimary: { type: String },
		recommendCompany: { type: Number },
		rmr: { type: Number },
		servcoName: { type: String }, //change to boolean later
		siteKind: { type: String },
		serviceScheduled: { type: String },
		serviceResolution: { type: String },
		serviceRepresentative: { type: String },
		satisfactionOverall: { type: Number },
		stmtFlag: { type: String },
		inMoveStatus: { type: String },
		timestamp: { type: Date, default: Date.now },
		contractStartDate: { type: Date },
		servicelevel: { type: String },
		callTransfer: { type: String },
		serviceRepresentativeAuthority: { type: Number },
		serviceRepresentativeCourtesy: { type: Number },
		serviceRepresentativeEmpathy: { type: Number },
		serviceRepresentativeKnowledge: { type: Number }
	},
	customerStats: {
		batchId: { type: Number },
		ces: { type: Number },
		nps: { type: Number },
		cstat: { type: Number },
		armr: { type: Number },
		timestamp: { type: Date, default: Date.now }
    },
    statistics: {
        client:{type:String},
        stat:{type:String},
        statType:{type:String},
        formula:{type:String},
        createdDate: { type: Date, default: Date.now },
        createdBy :{type:String},
        modifiedDate: { type: Date, default: Date.now },
        modifiedBy :{type:String},
        formulaParsed: {type: Object}
	},
	users: {
		email: { type: String, unique: true, lowercase: true, trim: true, required: true },
		fullName: { type: String, trim: true, required: false },
		gender: { type: String },
		hashPassword: { type: String, required: true },
		createdAt: { type: String, default: Date.now },
		companyId: { type: ObjectId, ref: 'Company' },
		role: { type: String }
	},
	companies: {
		name: { type: String, trim: true, required: false },
		owner: { type: String, trim: true, required: false },
		isActive: { type: Boolean, required: true },
		createdAt: { type: String, default: Date.now },
		updatedAt: { type: String, default: Date.now },
		createdBy: { type: ObjectId, ref: 'User' },
		updatedBy: { type: ObjectId, ref: 'User' }
	}
}

module.exports.dbSchema = schemas;