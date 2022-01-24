const Medication = require("../models/medication");
const AdministeredMedication = require("../models/medication_administration");
const { getUserId } = require("../utils");
const ObjectId = mongoose.Types.ObjectId;
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");
async function medication(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medication = await Medication.findOne({
      _id: args._id,
      user_id: user_id,
    });
    if (!medication) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medication: medication,
      };
    }
  }
  return returnable;
}
//Medications
async function medicationsOld(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({ user_id: user_id }).sort({
      purchase_date: -1,
      remaining_quantity: -1,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medications(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.aggregate([
      { $match: { user_id: ObjectId(user_id) } },
      {
        $project: {
          _id: 1,
          medication_name: 1,
          supplied_by: 1,
          quantity: 1,
          medicine_type: 1,
          quantity_type: 1,
          withdrawal_days_meat: 1,
          withdrawal_days_dairy: 1,
          remaining_quantity: 1,
          batch_number: 1,
          expiry_date: 1,
          purchase_date: 1,
          comments: 1,
          sort: {
            $cond: {
              if: {
                $eq: ["$remaining_quantity", 0],
              },
              then: "$remaining_quantity",
              else: "$purchase_date",
            },
          },
        },
      },
      {
        $sort: {
          sort: 1,
        },
      },
    ]);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications.reverse(),
      };
    }
  }
  return returnable;
}
async function medicationsLastThreeUsed(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedications = await AdministeredMedication.aggregate([
      { $match: { user_id: ObjectId(user_id) } },
      {
        $group: { _id: "$medication_id" },
      },
      {
        $lookup: {
          from: "medication",
          localField: "_id",
          foreignField: "_id",
          as: "medication",
        },
      },
    ])
      .sort({ date_of_administration: -1, _id: -1 })
      .limit(3);
    var medications = [];
    if (administeredMedications.length != 0) {
      for (var i = 0; i < administeredMedications.length; i++) {
        medications[i] = administeredMedications[i].medication[0];
      }
    } else {
      medications = await Medication.find({ user_id: user_id })
        .sort({ purchase_date: -1, _id: -1 })
        .limit(3);
    }
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsSortAndLimitTo4(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({ user_id: user_id })
      .sort({ remaining_quantity: 1 })
      .limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByType(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      medicine_type: args.medicine_type,
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByRemainingQtyLessThan(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      remaining_quantity: { $lte: args.remaining_quantity },
      user_id: user_id,
    }).limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByRemainingQtyGreaterThan(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      remaining_quantity: { $gte: args.remaining_quantity },
      user_id: user_id,
    }).limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsExpired(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      expiry_date: { $lt: Date.now() },
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByName(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    var str = args.medication_name;
    const medications = await Medication.find({
      medication_name: { $regex: new RegExp(".*" + str + ".*", "i") },
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}

module.exports = {
  medication,
  medications,
  medicationsOld,
  medicationsSortAndLimitTo4,
  medicationsByType,
  medicationsByRemainingQtyLessThan,
  medicationsByRemainingQtyGreaterThan,
  medicationsExpired,
  medicationsByName,
  medicationsLastThreeUsed,
};
